/**
 * sync-menudino.js — Sincroniza o cardápio do Menudino com o Firestore (cardapio-admin)
 *
 * Estratégia: merge defensivo
 *   - Atualiza nome e preço da fonte (Menudino é autoridade de preço)
 *   - Atualiza desc/imagem APENAS se a fonte retornou valor não-vazio
 *   - Preserva: ativo (decisão do admin), tags (decisão do admin)
 *   - Items novos do Menudino → adicionados
 *   - Items que sumiram do Menudino → marcados ativo:false (soft-delete)
 *   - Novas categorias → adicionadas à primeira aba
 *   - Respeita a divisão manual de abas feita pelo admin
 *
 * Pré-requisitos:
 *   1. npm install
 *   2. Copiar serviceAccountProd.json do projeto cardapio-admin para esta pasta
 *
 * Uso:
 *   npm run sync:menudino
 *
 * Para sincronização periódica (Windows Task Scheduler):
 *   Programa: node
 *   Argumentos: "C:\dev\clientes\marieta\scripts\sync-menudino.js"
 */

var https = require('https');
var admin = require('firebase-admin');
var path = require('path');
var fs = require('fs');

// --- Config ---
var RESTAURANT_SLUG = 'marieta-bistro';
var PROJECT = 'cardapio-admin-prod';
var MERCHANT_ID = '36cf4942-8b65-4d0b-baa5-cf9168b3b4de';
var MENUDINO_HOME = 'https://marietabistro.menudino.com/';
var MENUDINO_HOST = 'marietabistro.menudino.com';
var CATALOG_BASE = 'https://menudino-catalog.consumerapis.com/api/v1';
var FILES_BASE = 'https://files.menudino.com';
var CATEGORIAS_IGNORAR = ['Complemento'];
// Heurística: categorias cujo nome bate com qualquer palavra abaixo vão para a aba "Bebidas"
// (quando ela existir). Caso a aba não exista, caem na primeira aba.
var PALAVRAS_BEBIDAS = [
  'bebida', 'drink', 'vinho', 'cerveja', 'cervejas',
  'refrigerante', 'suco', 'sucos', 'cafe', 'café',
  'agua', 'água', 'dose', 'doses', 'whisky', 'vodka',
  'cachaça', 'cachaca', 'gin', 'aperitivo', 'chopp', 'chope'
];
var USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
var SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', 'serviceAccountProd.json');

// --- Verifica service account ---
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error('ERRO: serviceAccountProd.json não encontrado em ' + SERVICE_ACCOUNT_PATH);
  console.error('Copie o arquivo de: C:\\dev\\cardapio-admin\\serviceAccountProd.json');
  process.exit(1);
}

// --- Firebase Admin ---
var serviceAccount = require(SERVICE_ACCOUNT_PATH);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
var db = admin.firestore();

// --- Helpers de rede ---

function httpsRequest(options, body) {
  return new Promise(function(resolve, reject) {
    var req = https.request(options, function(res) {
      var chunks = [];
      res.on('data', function(chunk) { chunks.push(chunk); });
      res.on('end', function() {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks).toString('utf8')
        });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function browserHeaders(token) {
  var h = {
    'User-Agent': USER_AGENT,
    'Origin': 'https://' + MENUDINO_HOST,
    'Referer': MENUDINO_HOME,
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'pt-BR'
  };
  if (token) h['Authorization'] = 'Bearer ' + token;
  return h;
}

// --- 1. Autenticação: obter app-access-token via HEAD da home do Menudino ---

function fetchAppAccessToken() {
  return httpsRequest({
    method: 'GET',
    hostname: MENUDINO_HOST,
    path: '/',
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'text/html' }
  }).then(function(res) {
    var token = res.headers['app-access-token'];
    if (!token) {
      // fallback: tenta extrair do set-cookie (URL-encoded JWT)
      var cookies = res.headers['set-cookie'] || [];
      for (var i = 0; i < cookies.length; i++) {
        var m = cookies[i].match(/^app-access-token=([^;]+)/);
        if (m) { token = decodeURIComponent(m[1]); break; }
      }
    }
    if (!token) throw new Error('Não foi possível obter app-access-token do Menudino');
    return token;
  });
}

// --- 2. Fetch de categorias ---

function fetchCategories(token) {
  // SEM SellOnline=true — esse filtro restringe ao que o delivery serve AGORA.
  // Usamos OnlyActive=false para garantir o catálogo completo.
  var url = CATALOG_BASE + '/categories/' + MERCHANT_ID + '?OnlyActive=false';
  var u = new URL(url);
  return httpsRequest({
    method: 'GET',
    hostname: u.hostname,
    path: u.pathname + u.search,
    headers: browserHeaders(token)
  }).then(function(res) {
    if (res.statusCode !== 200) {
      throw new Error('fetchCategories HTTP ' + res.statusCode + ': ' + res.body.slice(0, 200));
    }
    var data = JSON.parse(res.body);
    return data.items || [];
  });
}

// --- 3a. Fetch de detalhes do merchant (para businessInfo) ---

function fetchMerchantDetails(token) {
  var url = 'https://menudino-merchants.consumerapis.com/api/v1/merchants/' + MERCHANT_ID;
  var u = new URL(url);
  return httpsRequest({
    method: 'GET',
    hostname: u.hostname,
    path: u.pathname + u.search,
    headers: browserHeaders(token)
  }).then(function(res) {
    if (res.statusCode !== 200) {
      throw new Error('fetchMerchantDetails HTTP ' + res.statusCode + ': ' + res.body.slice(0, 200));
    }
    return JSON.parse(res.body);
  });
}

// --- 3b. Fetch de items de uma categoria ---

function fetchItems(token, categoryId) {
  // SellOnline=false é a chave: com true, muitos itens ficam ocultos.
  var url = CATALOG_BASE + '/items/' + MERCHANT_ID + '/' + categoryId + '/summary?SellOnline=false';
  var u = new URL(url);
  return httpsRequest({
    method: 'GET',
    hostname: u.hostname,
    path: u.pathname + u.search,
    headers: browserHeaders(token)
  }).then(function(res) {
    if (res.statusCode !== 200) {
      throw new Error('fetchItems HTTP ' + res.statusCode + ' cat=' + categoryId + ': ' + res.body.slice(0, 200));
    }
    var data = JSON.parse(res.body);
    return data.items || [];
  });
}

// --- 4. Converter Menudino → formato cardapio-admin ---

function prefixHttps(url) {
  if (!url) return '';
  if (/^https?:\/\//.test(url)) return url;
  return FILES_BASE + '/' + url.replace(/^\//, '').replace(/^files\.menudino\.com\//, '');
}

function converterItem(item) {
  var imagem = '';
  if (item.hasPhoto) {
    imagem = prefixHttps(item.largeImageUrl || item.smallImageUrl || '');
  }
  return {
    nome: (item.name || '').trim(),
    desc: (item.description || '').trim(),
    preco: typeof item.salePrice === 'number' ? item.salePrice : 0,
    imagem: imagem,
    ativo: true,
    tags: []
  };
}

function converterMenudino(categories, itemsByCategoryId) {
  // Ordena categorias por sortIndex, filtra as ignoradas e as vazias
  var sorted = categories
    .slice()
    .sort(function(a, b) { return (a.sortIndex || 0) - (b.sortIndex || 0); });

  var categoriasFinais = [];
  sorted.forEach(function(cat) {
    if (CATEGORIAS_IGNORAR.indexOf(cat.name) !== -1) return;

    var rawItems = itemsByCategoryId[cat.id] || [];
    if (rawItems.length === 0) return; // pula vazias

    var itensOrdenados = rawItems
      .slice()
      .sort(function(a, b) { return (a.sortIndex || 0) - (b.sortIndex || 0); })
      .map(converterItem);

    categoriasFinais.push({
      titulo: (cat.name || '').trim(),
      nota: '',
      ativo: true,
      itens: itensOrdenados
    });
  });

  // Estrutura de uma única aba (o admin pode dividir depois; o merge preserva)
  return [{
    id: 'cardapio',
    label: 'Cardápio',
    ativo: true,
    categorias: categoriasFinais
  }];
}

// --- 4b. Converter merchant Menudino → businessInfo do site ---

var DIAS_PT = {
  Sunday: 'Dom', Monday: 'Seg', Tuesday: 'Ter',
  Wednesday: 'Qua', Thursday: 'Qui', Friday: 'Sex', Saturday: 'Sáb'
};
var DIAS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function formatarHora(hhmmss) {
  if (!hhmmss) return '';
  var parts = hhmmss.split(':');
  var h = parseInt(parts[0], 10);
  var m = parseInt(parts[1] || '0', 10);
  if (m === 0) return h + 'h';
  return h + 'h' + (m < 10 ? '0' + m : m);
}

function converterBusinessInfo(merchant) {
  var addr = merchant.address || {};
  var phoneRaw = (merchant.phone || '').trim();
  var phoneDigits = phoneRaw.replace(/\D/g, '');
  // WhatsApp: adiciona 55 se não começar com isso
  var whatsappNumber = phoneDigits.startsWith('55') ? phoneDigits : ('55' + phoneDigits);

  // Agrupa horários por dia
  var horariosPorDia = {};
  (merchant.openingHours || []).forEach(function(h) {
    if (!horariosPorDia[h.dayOfWeek]) horariosPorDia[h.dayOfWeek] = [];
    horariosPorDia[h.dayOfWeek].push({
      start: h.startTime,
      end: h.endTime,
      ehAlmoco: parseInt(h.startTime.split(':')[0], 10) < 17
    });
  });

  // Determina funcionamento (dias que aparecem)
  var diasAbertos = DIAS_ORDER.filter(function(d) { return horariosPorDia[d]; });
  var funcionamento = '';
  if (diasAbertos.length === 7) {
    funcionamento = 'Todos os dias';
  } else if (diasAbertos.length > 0) {
    funcionamento = diasAbertos.map(function(d) { return DIAS_PT[d]; }).join(', ');
  }

  // Constrói strings de almoço e jantar
  var almocos = [], jantares = [];
  diasAbertos.forEach(function(d) {
    horariosPorDia[d].forEach(function(h) {
      var txt = DIAS_PT[d] + ' ' + formatarHora(h.start) + '–' + formatarHora(h.end);
      if (h.ehAlmoco) almocos.push(txt);
      else jantares.push(txt);
    });
  });

  // Completo: linha por dia
  var completoLinhas = [];
  DIAS_ORDER.concat(['Sunday']).filter(function(d, i, a) { return a.indexOf(d) === i; }).forEach(function(d) {
    var hs = horariosPorDia[d];
    if (!hs) return;
    var parts = hs.map(function(h) { return formatarHora(h.start) + '–' + formatarHora(h.end); });
    completoLinhas.push(DIAS_PT[d] + ': ' + parts.join(' e '));
  });

  return {
    name: merchant.name || '',
    slogan: '',
    tagline: '',
    whatsapp: phoneRaw,
    whatsappNumber: whatsappNumber,
    phone: phoneRaw,
    address: [addr.street, addr.number].filter(Boolean).join(', '),
    neighborhood: addr.district || '',
    cityState: [addr.city, addr.state].filter(Boolean).join(' - '),
    cep: addr.zipCode || '',
    instagram: '',
    facebook: '',
    googleMapsLink: '',
    googleMapsEmbed: '',
    hours: {
      funcionamento: funcionamento,
      almoco: almocos.join(' | '),
      jantar: jantares.join(' | '),
      completo: completoLinhas.join(' | ')
    }
  };
}

// --- 4c. Merge defensivo de businessInfo ---

// Campos que JAMAIS sobrescrevemos se o atual tiver valor — são coisas que
// o admin configurou manualmente no cardapio-admin (Menudino não fornece).
var BIZ_PRESERVAR_SE_EXISTIR = [
  'slogan', 'tagline', 'instagram', 'facebook', 'googleMapsLink', 'googleMapsEmbed'
];

function mergeBusinessInfo(atual, novo) {
  if (!atual) return novo;
  var out = Object.assign({}, novo);
  // Campos preservados
  BIZ_PRESERVAR_SE_EXISTIR.forEach(function(k) {
    if (atual[k] && atual[k].length > 0) out[k] = atual[k];
  });
  // Hours: se novo não tiver algum campo, preserva do atual
  out.hours = Object.assign({}, atual.hours || {}, novo.hours || {});
  Object.keys(out.hours).forEach(function(k) {
    if (!out.hours[k] && atual.hours && atual.hours[k]) out.hours[k] = atual.hours[k];
  });
  return out;
}

// --- 5. Merge defensivo de cardápio ---

function normalizar(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Dado uma categoria nova, decide em qual aba ela deve cair.
// Retorna o índice da aba em `resultado`.
function escolherAbaParaCategoria(resultado, tituloCategoria) {
  var nomeNorm = normalizar(tituloCategoria);
  var ehBebida = PALAVRAS_BEBIDAS.some(function(p) {
    var pn = normalizar(p);
    return nomeNorm.indexOf(pn) !== -1;
  });

  if (ehBebida) {
    // procura aba "Bebidas" (ou similar)
    for (var i = 0; i < resultado.length; i++) {
      var labelNorm = normalizar(resultado[i].label || '');
      if (labelNorm.indexOf('bebida') !== -1) return i;
    }
  }
  // default: primeira aba
  return 0;
}

// Garante que existem duas abas "Cardápio" e "Bebidas" no resultado.
// Se já existem (por nome normalizado), não toca. Caso contrário, cria.
function garantirAbasPadrao(resultado) {
  var temCardapio = resultado.some(function(t) { return normalizar(t.label).indexOf('cardapio') !== -1 || normalizar(t.label).indexOf('menu') !== -1; });
  var temBebidas = resultado.some(function(t) { return normalizar(t.label).indexOf('bebida') !== -1; });
  if (!temCardapio) {
    resultado.unshift({ id: 'cardapio', label: 'Cardápio', ativo: true, categorias: [] });
  }
  if (!temBebidas) {
    resultado.push({ id: 'bebidas', label: 'Bebidas', ativo: true, categorias: [] });
  }
  return resultado;
}

function mergeCardapio(atual, novo) {
  var stats = {
    adicionados: 0,
    atualizados: 0,
    inativados: 0,
    preservados_desc: 0,
    preservados_imagem: 0,
    categorias_novas: 0,
    categorias_movidas: 0
  };

  // Se Firestore vazio, cria estrutura padrão com 2 abas e distribui
  if (!atual || !Array.isArray(atual) || atual.length === 0) {
    var resultadoInicial = garantirAbasPadrao([]);
    (novo[0].categorias || []).forEach(function(c) {
      var abaIdx = escolherAbaParaCategoria(resultadoInicial, c.titulo);
      resultadoInicial[abaIdx].categorias.push(c);
      stats.categorias_novas++;
      stats.adicionados += (c.itens || []).length;
    });
    return { cardapio: resultadoInicial, stats: stats };
  }

  // Indexa TODOS os items atuais por nome normalizado + categoria normalizada
  // Para respeitar a divisão manual de abas, mantemos quem está em qual aba
  var itensAtuaisPorNome = {}; // nomeNormalizado -> { item, tabIdx, catIdx, itemIdx }
  atual.forEach(function(tab, ti) {
    (tab.categorias || []).forEach(function(cat, ci) {
      (cat.itens || []).forEach(function(item, ii) {
        var key = normalizar(item.nome);
        if (key) itensAtuaisPorNome[key] = { item: item, tabIdx: ti, catIdx: ci, itemIdx: ii };
      });
    });
  });

  // Indexa categorias atuais por titulo normalizado
  var catsAtuaisPorTitulo = {};
  atual.forEach(function(tab, ti) {
    (tab.categorias || []).forEach(function(cat, ci) {
      var key = normalizar(cat.titulo);
      if (key) catsAtuaisPorTitulo[key] = { cat: cat, tabIdx: ti, catIdx: ci };
    });
  });

  // Clone profundo do atual para modificar
  var resultado = JSON.parse(JSON.stringify(atual));

  // Garante abas padrão
  resultado = garantirAbasPadrao(resultado);

  // Move categorias existentes para a aba correta segundo a heurística
  // (one-shot: se estavam no lugar errado, corrige)
  var abasMovimentadas = true;
  while (abasMovimentadas) {
    abasMovimentadas = false;
    for (var ti = 0; ti < resultado.length; ti++) {
      var cats = resultado[ti].categorias || [];
      for (var ci = 0; ci < cats.length; ci++) {
        var abaAlvo = escolherAbaParaCategoria(resultado, cats[ci].titulo);
        if (abaAlvo !== ti) {
          var catMovida = cats.splice(ci, 1)[0];
          resultado[abaAlvo].categorias = resultado[abaAlvo].categorias || [];
          resultado[abaAlvo].categorias.push(catMovida);
          stats.categorias_movidas++;
          abasMovimentadas = true;
          break; // reinicia o loop — a lista mudou
        }
      }
      if (abasMovimentadas) break;
    }
  }

  // Re-indexa item positions (tabIdx/catIdx) depois dos movimentos
  itensAtuaisPorNome = {};
  catsAtuaisPorTitulo = {};
  resultado.forEach(function(tab, ti) {
    (tab.categorias || []).forEach(function(cat, ci) {
      (cat.itens || []).forEach(function(item, ii) {
        var key = normalizar(item.nome);
        if (key) itensAtuaisPorNome[key] = { item: item, tabIdx: ti, catIdx: ci, itemIdx: ii };
      });
      var ckey = normalizar(cat.titulo);
      if (ckey) catsAtuaisPorTitulo[ckey] = { cat: cat, tabIdx: ti, catIdx: ci };
    });
  });

  // Track items do Menudino vistos (para soft-delete depois)
  var vistosNoMenudino = {};

  // Processa cada categoria do Menudino
  var categoriasMenudino = (novo[0] && novo[0].categorias) || [];
  categoriasMenudino.forEach(function(catNova) {
    var catKey = normalizar(catNova.titulo);
    var catMatch = catsAtuaisPorTitulo[catKey];
    var targetCat;

    if (!catMatch) {
      // Categoria nova → roteia por heurística (bebida → aba Bebidas; senão primeira aba)
      stats.categorias_novas++;
      var abaIdx = escolherAbaParaCategoria(resultado, catNova.titulo);
      resultado[abaIdx].categorias = resultado[abaIdx].categorias || [];
      targetCat = {
        titulo: catNova.titulo,
        nota: '',
        ativo: true,
        itens: []
      };
      resultado[abaIdx].categorias.push(targetCat);
    } else {
      targetCat = resultado[catMatch.tabIdx].categorias[catMatch.catIdx];
    }

    // Merge de cada item
    catNova.itens.forEach(function(itemNovo) {
      var itemKey = normalizar(itemNovo.nome);
      vistosNoMenudino[itemKey] = true;

      var atualInfo = itensAtuaisPorNome[itemKey];
      if (!atualInfo) {
        // Item novo → adiciona na categoria correspondente
        targetCat.itens.push(itemNovo);
        stats.adicionados++;
        return;
      }

      // Item existente → merge defensivo
      var itemAtual = resultado[atualInfo.tabIdx].categorias[atualInfo.catIdx].itens[atualInfo.itemIdx];

      // preço: sempre atualiza
      itemAtual.preco = itemNovo.preco;

      // desc: só atualiza se fonte trouxe valor
      if (itemNovo.desc && itemNovo.desc.length > 0) {
        itemAtual.desc = itemNovo.desc;
      } else if (itemAtual.desc) {
        stats.preservados_desc++;
      }

      // imagem: só atualiza se fonte trouxe valor
      if (itemNovo.imagem && itemNovo.imagem.length > 0) {
        itemAtual.imagem = itemNovo.imagem;
      } else if (itemAtual.imagem) {
        stats.preservados_imagem++;
      }

      // nome: atualiza (cosmético)
      itemAtual.nome = itemNovo.nome;

      // ativo e tags: preserva (não mexe)

      stats.atualizados++;
    });
  });

  // Soft-delete: items que existem no Firestore mas não apareceram no Menudino desta rodada
  Object.keys(itensAtuaisPorNome).forEach(function(key) {
    if (vistosNoMenudino[key]) return;
    var info = itensAtuaisPorNome[key];
    var itemRef = resultado[info.tabIdx].categorias[info.catIdx].itens[info.itemIdx];
    if (itemRef.ativo !== false) {
      itemRef.ativo = false;
      stats.inativados++;
    }
  });

  return { cardapio: resultado, stats: stats };
}

// --- Main ---

async function run() {
  console.log('=== sync-menudino ===');
  console.log('Restaurante: ' + RESTAURANT_SLUG);
  console.log('Projeto: ' + PROJECT);
  console.log('');

  console.log('1/6 Obtendo app-access-token...');
  var token = await fetchAppAccessToken();
  console.log('    OK (token len=' + token.length + ')');

  console.log('2/6 Buscando merchant details (businessInfo)...');
  var merchant = await fetchMerchantDetails(token);
  console.log('    OK: ' + merchant.name + ' — ' + (merchant.address && merchant.address.city));

  console.log('3/6 Buscando categorias do Menudino...');
  var categories = await fetchCategories(token);
  console.log('    ' + categories.length + ' categorias retornadas');

  console.log('4/6 Buscando items de cada categoria...');
  var itemsByCategoryId = {};
  var totalItems = 0;
  for (var i = 0; i < categories.length; i++) {
    var cat = categories[i];
    // pequeno delay para ser gentil com a API
    if (i > 0) await new Promise(function(r) { setTimeout(r, 100); });
    try {
      var items = await fetchItems(token, cat.id);
      itemsByCategoryId[cat.id] = items;
      totalItems += items.length;
      process.stdout.write('    [' + (i + 1) + '/' + categories.length + '] ' + cat.name + ': ' + items.length + ' items\n');
    } catch (e) {
      console.error('    ERRO em categoria "' + cat.name + '": ' + e.message);
      itemsByCategoryId[cat.id] = [];
    }
  }
  console.log('    Total: ' + totalItems + ' items');

  console.log('5/6 Convertendo e fazendo merge com Firestore...');
  var cardapioNovo = converterMenudino(categories, itemsByCategoryId);
  var businessInfoNovo = converterBusinessInfo(merchant);

  var dataRef = db.collection('restaurants').doc(RESTAURANT_SLUG).collection('data');
  var docRef = dataRef.doc('cardapio');
  var bizRef = dataRef.doc('businessInfo');

  var docSnap = await docRef.get();
  var cardapioAtual = null;
  if (docSnap.exists) {
    var raw = docSnap.data();
    cardapioAtual = raw.content || null;
    var totalAbasAtuais = (cardapioAtual || []).length;
    console.log('    Cardápio atual no Firestore: ' + totalAbasAtuais + ' aba(s)');
  } else {
    console.log('    Nenhum cardápio no Firestore ainda (primeiro upload)');
  }

  var bizSnap = await bizRef.get();
  var businessInfoAtual = bizSnap.exists ? (bizSnap.data().content || null) : null;

  var merged = mergeCardapio(cardapioAtual, cardapioNovo);
  var stats = merged.stats;
  var businessInfoMerged = mergeBusinessInfo(businessInfoAtual, businessInfoNovo);

  console.log('6/6 Escrevendo no Firestore...');
  await docRef.set({
    content: merged.cardapio,
    updatedAt: new Date().toISOString()
  });
  await bizRef.set({
    content: businessInfoMerged,
    updatedAt: new Date().toISOString()
  });

  console.log('');
  console.log('=== Sync concluída ===');
  console.log('  Categorias novas:       ' + stats.categorias_novas);
  console.log('  Categorias reorganizadas: ' + (stats.categorias_movidas || 0));
  console.log('  Items adicionados:      ' + stats.adicionados);
  console.log('  Items atualizados:      ' + stats.atualizados);
  console.log('  Items inativados:       ' + stats.inativados);
  console.log('  Desc preservadas:       ' + stats.preservados_desc);
  console.log('  Imagens preservadas:    ' + stats.preservados_imagem);
  console.log('');
  console.log('  Estrutura final:');
  (merged.cardapio || []).forEach(function(tab) {
    var nCats = (tab.categorias || []).length;
    var nItens = 0;
    (tab.categorias || []).forEach(function(c) { nItens += (c.itens || []).length; });
    console.log('    [' + tab.label + '] ' + nCats + ' categorias, ' + nItens + ' items');
  });
  console.log('');
  process.exit(0);
}

run().catch(function(err) {
  console.error('');
  console.error('Erro fatal:', err && err.stack ? err.stack : err);
  process.exit(1);
});
