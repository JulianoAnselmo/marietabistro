# Guia de Deploy — Marieta Bistrô

Deploy no **GitHub Pages** com domínio personalizado `marietabistro.com.br`.

---

## O que o GitHub Pages faz automaticamente

- ✅ HTTPS gratuito (Let's Encrypt) — sem configurar nada
- ✅ Compressão GZIP em HTML, CSS, JS
- ✅ CDN global (via Fastly)
- ✅ Suporte a `404.html` customizado
- ✅ Suporte a domínio personalizado
- ✅ Bandwidth: 100GB/mês

---

## Passo 1 — Repositório já está no GitHub

O repositório está em:
```
https://github.com/JulianoAnselmo/marietabistro
```

---

## Passo 2 — Ativar GitHub Pages

1. Acesse `https://github.com/JulianoAnselmo/marietabistro`
2. Clique em **Settings** (no topo)
3. No menu lateral → **Pages**
4. Em **Build and deployment → Source**, selecione **Deploy from a branch**
5. Em **Branch**, selecione **main** e pasta **/ (root)**
6. Clique em **Save**
7. Aguarde ~1 minuto

O site estará disponível em:
`https://julianoAnselmo.github.io/marietabistro/`

---

## Passo 3 — Configurar domínio personalizado (`marietabistro.com.br`)

### 3.1 — Arquivo CNAME (já está no repositório)

O arquivo `CNAME` na raiz do projeto contém:
```
marietabistro.com.br
```

Isso já foi commitado — não precisa fazer nada.

### 3.2 — Configurar DNS no registrador do domínio

Acesse o painel onde o domínio `marietabistro.com.br` está registrado e adicione:

**Registros A** (domínio raiz):

| Tipo | Nome | Valor            |
|------|------|------------------|
| A    | `@`  | 185.199.108.153  |
| A    | `@`  | 185.199.109.153  |
| A    | `@`  | 185.199.110.153  |
| A    | `@`  | 185.199.111.153  |

**Registro CNAME** (subdomínio www):

| Tipo  | Nome  | Valor                            |
|-------|-------|----------------------------------|
| CNAME | `www` | `julianoAnselmo.github.io`       |

Salve e aguarde propagação (15 min a 24h).

Para verificar:
```bash
nslookup marietabistro.com.br
# deve retornar 185.199.x.x
```

### 3.3 — Configurar domínio no GitHub Pages

1. Em **Settings → Pages → Custom domain**, digite `marietabistro.com.br`
2. Clique **Save** — GitHub verifica o DNS automaticamente
3. Aguarde alguns minutos para o certificado SSL ser emitido
4. Marque **Enforce HTTPS**

Site no ar em `https://marietabistro.com.br` ✅

---

## Passo 4 — Analytics (GoatCounter)

Analítica gratuita, sem cookies, sem LGPD.

### 4.1 — Criar conta

1. Acesse https://www.goatcounter.com/signup
2. Crie conta gratuita (até 100k pageviews/mês)
3. Escolha um site code, ex: `marieta`

### 4.2 — Adicionar ao site

No `index.html`, antes do `</body>`, adicionar:

```html
<script data-goatcounter="https://marieta.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>
```

Substitua `marieta` pelo código que você escolheu.

---

## Passo 5 — Google Search Console

Para monitorar cliques do Google.

1. Acesse https://search.google.com/search-console
2. Clique em **Adicionar propriedade** → tipo **Domínio**
3. Digite `marietabistro.com.br`
4. Adicione o registro TXT no DNS:

| Tipo | Nome | Valor                        |
|------|------|------------------------------|
| TXT  | `@`  | `google-site-verification=…` |

5. Aguarde 5-10 min e clique **Verificar**
6. Em **Sitemaps**, adicione: `sitemap.xml`

---

## Deploy contínuo

Qualquer `git push` para `main` atualiza o site em ~1 minuto:

```bash
git add .
git commit -m "feat: descrição da mudança"
git push
```

---

## Estrutura do projeto

```
marieta/
├── index.html          ← site principal (único HTML)
├── cardapio.js         ← dados de fallback do cardápio
├── promocoes.js        ← dados de fallback das promoções
├── atualizar-instagram.js ← script de atualização (GitHub Actions)
├── CNAME               ← domínio personalizado
├── .nojekyll           ← desativa Jekyll no GitHub Pages
├── robots.txt          ← SEO
├── sitemap.xml         ← SEO
├── 404.html            ← página de erro customizada
├── fonts/              ← fontes locais
└── imagens/            ← imagens do site
```

---

## Ferramentas de validação pós-deploy

| Ferramenta | URL | O que verifica |
|---|---|---|
| PageSpeed Insights | https://pagespeed.web.dev | Performance mobile/desktop |
| Mobile-Friendly | https://search.google.com/test/mobile-friendly | Responsividade |
| Schema Validator | https://validator.schema.org | JSON-LD (dados estruturados) |
| HTTPS Checker | https://www.whynopadlock.com | Mixed content |

---

## Resolver problemas comuns

**"Page not found" após o push:**
- Aguarde 1-2 min
- Confirme que `index.html` está na raiz (não em subpasta)
- Em Settings → Pages, confirme branch `main` e `/ (root)`

**Certificado SSL não emitido:**
- Aguarde até 24h após apontar o DNS
- Se persistir: remova e re-adicione o domínio em Settings → Pages

**Imagens não aparecem:**
- Nomes de arquivo são case-sensitive no Linux (servidor do GitHub)
- `Fachada.jpg` ≠ `fachada.jpg` — padronize em minúsculas

**Cardápio não atualiza:**
- O site lê do Firestore (`cardapio-admin-prod`) quando online
- `cardapio.js` é usado apenas como fallback local (arquivo)
- Se o cardápio mudou no admin mas não no site, aguarde o cache do browser (Ctrl+Shift+R)
