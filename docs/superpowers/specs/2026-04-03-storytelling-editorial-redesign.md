# Marieta Bistrô — Storytelling Editorial Redesign

## Contexto

O site da Marieta Bistrô é funcional mas tem visual datado, performance abaixo do ideal e conversão baixa. O objetivo é transformá-lo num fluxo narrativo imersivo — cada seção conta um capítulo da história do restaurante — enquanto otimiza performance e melhora a hierarquia de CTAs. A estrutura de arquivo único (index.html + JS auxiliares) será mantida.

## Decisões de Design

- **Abordagem**: Storytelling Editorial — evolução moderada da identidade visual
- **Arquivo único**: Manter index.html com CSS inline, sem migrar pra framework
- **Paleta**: Manter essência vinho/dourado, evoluir com gradientes mais quentes e tons sutis
- **Tipografia**: Manter Cormorant Garamond + Outfit
- **Dados**: Continuar usando Firebase Firestore com fallback local

---

## 1. Hero Cinematográfico

**Arquivo**: `index.html` — seção `.hero`

**Mudanças:**
- Headline emotiva: "Onde a história encontra o sabor" em vez de só o nome
- Contexto temporal: "DESDE 1920 · TAQUARITINGA, SP" como label
- CTA único principal: "Reserve sua mesa" em destaque
- CTA secundário como text link: "ou explore o cardápio"
- Badge de prova social: "★★★★★ 4.9 no Google · 128+ avaliações"
- Scroll indicator animado no bottom
- Preloader inteligente: baseado em `window.onload` real com timeout máximo de 3s (atual: timer fixo de 2.2s)

---

## 2. Sobre — Timeline Narrativa

**Arquivo**: `index.html` — seção `.about`

**Mudanças:**
- Substituir layout texto+imagem por timeline vertical com 3 capítulos
- **Capítulo 1 — "Década de 1920"**: A Vovó Marieta, origem da tradição, foto `historia-vo-marieta.jpg`
- **Capítulo 2 — "O Casarão"**: Centenário restaurado, foto da fachada `5e8f8d97...png`
- **Capítulo 3 — "Hoje"**: Chef Ricardo Vagner, marcador dourado (gold), foto `afb4c45e...png`
- Headline: "Três gerações, um mesmo amor à mesa"
- Cada capítulo com scroll reveal individual e foto contextualizada
- Linha vertical conectando os pontos da timeline (gradient wine → transparente)

---

## 3. Cardápio — Visual Aprimorado

**Arquivo**: `index.html` — seção `.menu` + função `renderCardapio()`

**Mudanças:**
- Tabs com emojis (🍽 Entradas, 🍝 Massas, 🥩 Carnes, 🐟 Peixes, 🍚 Risotos, 🍰 Sobremesas, 🍸 Drinks, 🍷 Bebidas)
- Tabs com border-radius quadrado (8px) em vez de pills
- Pratos destaque: card com espaço para foto (quando campo `imagem` existir no Firestore)
- Badge "Favorito do Chef" (quando campo `destaque` existir no Firestore)
- Items regulares mantém layout lista com preço em gold
- Fundo sutil (rgba branco 0.03) e borda (rgba branco 0.05) nos cards

**Nota**: As fotos e badges dependem de campos opcionais no Firestore. Quando ausentes, o item renderiza como hoje (sem foto, sem badge). Nenhuma mudança no schema do Firestore é obrigatória.

---

## 4. Galeria — Layout Editorial Masonry

**Arquivo**: `index.html` — seção `.gallery`

**Mudanças:**
- Substituir grid uniforme 3x2 por layout masonry com CSS Grid
- Imagem hero (2 colunas) com caption "O Ambiente — Salão principal"
- Imagem vertical (2 rows) para variar ritmo
- Imagem wide (3 colunas) no bottom com caption "A Cozinha — Nos bastidores"
- Captions editoriais com label uppercase dourado + título serif
- Manter lightbox atual no click
- Hover: zoom + overlay wine (já existe, manter)

---

## 5. Depoimentos — Carrossel com Prova Social

**Arquivo**: `index.html` — seção `.testimonials`

**Mudanças:**
- Badge Google consolidado no topo: nota 4.9 + "128+ avaliações no Google"
- Trocar grid de 3 cards por carrossel com 1 destaque por vez
- Card maior com aspas decorativas e fundo wine sutil
- Auto-play suave (5s por slide) com pause on hover
- Dots de navegação (active = pill dourada, inactive = circle transparente)
- Carrossel implementado em CSS puro com scroll-snap (sem biblioteca externa)

---

## 6. Eventos — Cards Modernizados

**Arquivo**: `index.html` — seção `.events`

**Mudanças:**
- Ícones emoji em vez de SVGs genéricos (🍽 Corporativo, 🎂 Aniversários, 🍷 Privados)
- Background ícone com fundo wine sutil (rgba) e border-radius 12px
- CTA individual por card: "SOLICITAR →" que leva pro WhatsApp com mensagem pré-preenchida específica por tipo de evento
- Cards com sombra elevada e borda sutil
- Remover botão "Solicitar Orçamento" genérico do bottom (cada card tem seu CTA agora)

---

## 7. Otimizações de Performance

**Arquivo**: `index.html` + imagens

### Imagens
- Converter todas as imagens para WebP (redução de 60-70%)
- Adicionar srcset para telas retina (1x e 2x)
- Implementar placeholder blur (LQIP) com base64 inline de ~20px
- Manter `loading="lazy"` nos `<img>` abaixo do fold

### Preloader
- Substituir `setTimeout(2200)` por listener no `window.onload`
- Timeout máximo de 3s como fallback (safety net)
- Transição suave mantida

### Google Maps
- Lazy load do iframe: só inserir src quando seção contato ficar visível via IntersectionObserver
- Placeholder estático (div com cor de fundo) até o scroll
- Economia estimada: ~800KB no carregamento inicial

### CSS & Fontes
- `font-display: swap` nas fontes Google (evita FOIT)
- Preconnect já existe — manter
- Minificar HTML/CSS/JS na build para dist/

---

## Seções Não Alteradas

As seguintes seções mantêm design atual com ajustes mínimos:
- **Promo Banner**: Mantém como está (funcional, não conflita com novo hero)
- **Header**: Mantém com scroll behavior atual
- **Experiência/Convite**: Mantém (já tem parallax e CTAs)
- **Instagram**: Mantém grid 6 colunas
- **Contato**: Mantém layout grid 2 colunas (só adiciona lazy load do Maps)
- **Footer**: Mantém como está
- **WhatsApp flutuante**: Mantém como está

---

## Verificação

Para testar as mudanças end-to-end:

1. **Visual**: Abrir `index.html` no navegador e verificar cada seção modificada
2. **Responsivo**: Testar em viewport 375px (mobile), 768px (tablet) e 1440px (desktop)
3. **Performance**: Rodar Lighthouse no Chrome DevTools — target: score 80+ em Performance
4. **Cardápio**: Verificar que dados do Firestore carregam corretamente com novo layout
5. **Carrossel**: Testar auto-play, pause on hover, e navegação por dots
6. **Galeria**: Verificar lightbox funciona com novo layout masonry
7. **CTAs**: Verificar que todos os links WhatsApp abrem com mensagem pré-preenchida correta
8. **Maps**: Verificar que iframe carrega só quando seção contato fica visível
9. **Imagens WebP**: Verificar fallback para navegadores que não suportam WebP (picture + source)
