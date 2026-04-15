# Scripts de sincronização — Marieta Bistrô

Scripts para sincronizar o cardápio do Marieta a partir do [Menudino](https://marietabistro.menudino.com/) para o Firestore do cardapio-admin (projeto `cardapio-admin-prod`). O site do Marieta já lê desse Firestore, então não é preciso mexer no código do site.

## 🎯 Modo recomendado: botão no cardapio-admin

A forma mais fácil é usar o botão **"Sincronizar Menudino"** que está na barra de ações do editor de cardápio do cardapio-admin (`/restaurante/marieta-bistro/cardapio`):

1. Abre o Marieta no cardapio-admin
2. Abre [https://marietabistro.menudino.com/](https://marietabistro.menudino.com/) em outra aba
3. Pressiona `F12` → aba Console → cola `copy(document.cookie)` → Enter
4. Volta no cardapio-admin, clica em **Sincronizar Menudino**, cola o cookie no modal e clica em Sincronizar

Pronto. Não precisa rodar script local, não precisa de serviços, não precisa agendamento — roda no browser do navegador do admin (IP residencial) em ~10 segundos.

> **Por que não posso rodar isso num servidor?** O Cloudflare do Menudino tem Bot Fight Mode que rejeita qualquer IP de datacenter (GitHub Actions, Cloud Functions, Cloudflare Workers, etc) com HTTP 403, mesmo usando Puppeteer + stealth plugin. Só passa de IP residencial.

## Modo alternativo (script local)

Os scripts abaixo existem para casos em que você precise rodar fora do browser (debugging, automação local com Task Scheduler, etc). Fazem exatamente a mesma coisa que o botão no admin, mas a partir do terminal.

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

## Rodar agendado via Windows Task Scheduler

> **Por que não GitHub Actions?** O Cloudflare do Menudino tem Bot Fight Mode que rejeita qualquer request vinda de IPs de datacenter (GitHub Actions, Azure, AWS, Cloudflare Workers, etc) com HTTP 403 "Attention Required", mesmo com Puppeteer + plugin stealth. O único jeito é rodar o script numa máquina com IP residencial — exatamente o mesmo padrão que o pizzakid usa.

O arquivo [`sync-menudino.bat`](sync-menudino.bat) é um wrapper que o Task Scheduler pode chamar diretamente. Ele muda pro diretório certo, roda `npm run sync:menudino` e acrescenta o output num arquivo de log (`scripts/sync-menudino.log`, ignorado pelo git).

### Passos para agendar (só faz uma vez)

1. Abrir o **Task Scheduler** do Windows (`Win+R` → `taskschd.msc`).
2. Menu lateral direito → **`Create Basic Task...`**.
3. Na tela:
   - **Name**: `Sync cardapio Marieta Menudino`
   - **Description**: `Puxa cardapio do Menudino e grava no Firestore`
   - **Trigger**: `Daily` → hora que preferir (ex: 03:30)
   - **Action**: `Start a program`
   - **Program/script**: `C:\dev\clientes\marieta\scripts\sync-menudino.bat`
   - **Add arguments**: (deixe em branco)
   - **Start in**: (deixe em branco — o `.bat` faz `cd` sozinho)
4. Finalizar. A task aparece na lista `Task Scheduler Library`.

### Testar que funciona

- **Manualmente via Task Scheduler**: botão direito na task → `Run`.
- **Manualmente via terminal**: `scripts\sync-menudino.bat` na raiz do projeto marieta.
- **Ver log**: `type scripts\sync-menudino.log` (histórico de todas execuções).

### Requisitos

- PC ligado na hora do trigger (o Task Scheduler do Windows tem opção "Run task as soon as possible after a scheduled start is missed" para executar mesmo se o PC estava desligado — marque essa opção na aba `Settings` da task).
- Service account `serviceAccountProd.json` na raiz do projeto marieta.
- Node.js 18+ no PATH (o `.bat` usa `npm run`).

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
