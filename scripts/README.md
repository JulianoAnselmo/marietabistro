# Scripts de sincronização — Marieta Bistrô

Scripts para sincronizar o cardápio do Marieta a partir do [Menudino](https://marietabistro.menudino.com/) para o Firestore do cardapio-admin (projeto `cardapio-admin-prod`). O site do Marieta já lê desse Firestore, então não é preciso mexer no código do site.

## Arquivos

| Arquivo | Função |
|---|---|
| `sync-menudino.js` | Puxa categorias + items + merchant do Menudino e escreve no Firestore (merge defensivo) |
| `cleanup-inactive.js` | Remove items marcados como `ativo: false` (órfãos de migrações anteriores) |

## Rodar localmente

### Pré-requisitos

1. **Node.js 18+** (o GitHub Actions usa Node 20)
2. **`serviceAccountProd.json`** na raiz do projeto marieta — copiar de `C:\dev\cardapio-admin\serviceAccountProd.json`. Nunca commitar (já está no `.gitignore`).

### Instalação

```bash
cd C:\dev\clientes\marieta
npm install
```

### Uso

```bash
# Sincronizar cardápio + businessInfo
npm run sync:menudino

# Listar items inativos (dry run)
npm run cleanup:inactive

# Deletar items inativos
npm run cleanup:inactive -- --apply
```

## Rodar agendado via GitHub Actions

O workflow [`.github/workflows/sync-menudino.yml`](../.github/workflows/sync-menudino.yml) roda o sync automaticamente todo dia às ~01h17 (horário de Brasília), e também pode ser disparado manualmente pelo GitHub.

### Configurar o secret `FIREBASE_SERVICE_ACCOUNT_PROD`

Só precisa fazer uma vez. O workflow lê o JSON do service account de um GitHub Secret.

1. Abrir o `serviceAccountProd.json` no bloco de notas e copiar **todo o conteúdo** (é um JSON com `private_key`, `client_email`, etc).

2. Abrir o repositório no GitHub → `Settings` → `Secrets and variables` → `Actions` → botão **`New repository secret`**.

3. Preencher:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT_PROD`
   - **Secret:** colar o JSON inteiro (começando em `{` e terminando em `}`)

4. Clicar `Add secret`.

### Rodar manualmente pelo GitHub

1. Repositório no GitHub → aba `Actions`.
2. Na lista da esquerda, selecionar `Sync cardapio Menudino`.
3. Botão **`Run workflow`** à direita → `Run workflow` de novo (confirmar).
4. Ver o log em tempo real.

### Mudar a frequência

Editar a linha `cron: '17 4 * * *'` em [`sync-menudino.yml`](../.github/workflows/sync-menudino.yml). O formato é `min hour dayOfMonth month dayOfWeek` em UTC.

Exemplos:
- `'17 4 * * *'` → diariamente às 04:17 UTC (~01:17 BRT)
- `'17 4 * * 1'` → toda segunda-feira às 04:17 UTC
- `'0 */6 * * *'` → a cada 6 horas

## Como funciona a sincronização

1. **Auth**: faz um `GET https://marietabistro.menudino.com/` e extrai o JWT `app-access-token` do header (dura ~24h).
2. **Merchant**: `GET menudino-merchants.consumerapis.com/api/v1/merchants/{id}` → nome, endereço, telefone, horários.
3. **Categorias**: `GET menudino-catalog.consumerapis.com/api/v1/categories/{id}?OnlyActive=false` → 22+ categorias (**sem** `SellOnline=true`, que restringiria ao delivery do momento).
4. **Items por categoria**: `GET .../items/{id}/{categoryId}/summary?SellOnline=false` → items completos com descrição, preço, `largeImageUrl`.
5. **Merge defensivo** com o que já está no Firestore:
   - Preço: sempre atualiza
   - Descrição: só atualiza se a fonte tem valor (preserva se vazia)
   - Imagem: só atualiza se a fonte tem valor
   - `ativo` e `tags`: **nunca sobrescreve** (preserva decisões do admin)
   - Items que sumiram da fonte: marcados `ativo: false` (soft-delete)
6. **Roteamento de abas**: categorias cujo nome contém "bebida/drink/vinho/cerveja/refrigerante/suco/café/água/dose/..." são roteadas automaticamente para a aba "Bebidas". O resto vai para "Cardápio". Se as abas não existirem, são criadas.
7. **businessInfo**: popula nome, endereço, telefone, horários (separando almoço/jantar). Preserva `slogan`, `instagram`, `facebook`, `googleMapsLink`, `googleMapsEmbed` que o admin configurou manualmente.

## Troubleshooting

**`HTTP 403` do Menudino** → Cloudflare WAF está bloqueando. Verifique que o `User-Agent` enviado corresponde a um browser real (já está hardcoded no script).

**`Não foi possível obter app-access-token`** → o Menudino pode ter alterado o nome do header/cookie. Rodar `curl -sI https://marietabistro.menudino.com/` e procurar por algum header parecido.

**`HTTP 404` em `/categories/`** → URL mudou. Inspecionar o novo endpoint abrindo o DevTools no site do Menudino e olhando a aba Network.

**Itens com descrição vazia** → a fonte não tem. O merge defensivo preserva a descrição existente no Firestore — basta completar manualmente no cardapio-admin e ela não vai ser apagada na próxima sync.
