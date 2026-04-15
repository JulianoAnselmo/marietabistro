/**
 * cleanup-inactive.js — Remove items com `ativo: false` do cardápio.
 *
 * Modo padrão: DRY RUN (só lista o que seria deletado).
 * Para deletar de verdade: `npm run cleanup:inactive -- --apply`
 *
 * Contexto: na primeira sync do Menudino, items antigos que existiam no
 * Firestore mas não vieram da fonte foram marcados como inativos (soft-delete).
 * Este script limpa esses órfãos, deixando só o que o Menudino realmente retorna.
 *
 * ATENÇÃO: items que o admin inativou manualmente no cardapio-admin (ex: pratos
 * fora do cardápio temporariamente) TAMBÉM serão removidos. Se quiser manter
 * algum, reative antes de rodar este script.
 */

var admin = require('firebase-admin');
var path = require('path');
var fs = require('fs');

var RESTAURANT_SLUG = 'marieta-bistro';
var SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', 'serviceAccountProd.json');
var APPLY = process.argv.indexOf('--apply') !== -1;

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error('ERRO: serviceAccountProd.json não encontrado.');
  process.exit(1);
}

var serviceAccount = require(SERVICE_ACCOUNT_PATH);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
var db = admin.firestore();

async function run() {
  console.log('=== cleanup-inactive ===');
  console.log('Modo: ' + (APPLY ? 'APPLY (vai deletar)' : 'DRY RUN (só lista)'));
  console.log('');

  var docRef = db.collection('restaurants').doc(RESTAURANT_SLUG).collection('data').doc('cardapio');
  var snap = await docRef.get();
  if (!snap.exists) {
    console.log('Nenhum cardápio encontrado.');
    process.exit(0);
  }

  var cardapio = snap.data().content || [];
  var removidos = 0;
  var removidosLista = [];

  var novoCardapio = cardapio.map(function(tab) {
    var novasCategorias = (tab.categorias || []).map(function(cat) {
      var ativos = [];
      (cat.itens || []).forEach(function(item) {
        if (item.ativo === false) {
          removidos++;
          removidosLista.push('[' + tab.label + '] ' + cat.titulo + ' → ' + item.nome);
        } else {
          ativos.push(item);
        }
      });
      return Object.assign({}, cat, { itens: ativos });
    }).filter(function(cat) {
      // remove também categorias que ficaram vazias
      return (cat.itens || []).length > 0;
    });
    return Object.assign({}, tab, { categorias: novasCategorias });
  });

  console.log('Items a remover: ' + removidos);
  removidosLista.forEach(function(line) {
    console.log('  - ' + line);
  });

  if (!APPLY) {
    console.log('');
    console.log('(dry run — nada foi alterado)');
    console.log('Para aplicar: npm run cleanup:inactive -- --apply');
    process.exit(0);
  }

  if (removidos === 0) {
    console.log('Nada para remover.');
    process.exit(0);
  }

  console.log('');
  console.log('Aplicando alterações...');
  await docRef.set({
    content: novoCardapio,
    updatedAt: new Date().toISOString()
  });
  console.log('Pronto. ' + removidos + ' items removidos.');
  process.exit(0);
}

run().catch(function(err) {
  console.error('Erro:', err && err.stack ? err.stack : err);
  process.exit(1);
});
