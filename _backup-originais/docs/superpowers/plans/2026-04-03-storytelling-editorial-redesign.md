# Storytelling Editorial Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Marieta Bistrô website from a standard landing page into an immersive editorial storytelling experience, while improving performance and conversion.

**Architecture:** Single-file approach maintained (index.html with inline CSS/JS). Changes are CSS + HTML modifications within the existing file, plus JS updates for carousel and lazy loading. Image optimization done externally. Each task modifies specific line ranges in index.html.

**Tech Stack:** HTML5, CSS3 (inline), Vanilla JS, Firebase Firestore (existing), CSS scroll-snap for carousel.

**Spec:** `docs/superpowers/specs/2026-04-03-storytelling-editorial-redesign.md`

---

## File Structure

All changes are in a single file:
- **Modify:** `index.html` (CSS sections ~lines 62-1940, HTML sections ~lines 1943-2482, JS ~lines 2484-2814)

No new files created (except WebP images generated from existing PNGs).

---

### Task 1: Hero Cinematográfico — CSS

**Files:**
- Modify: `index.html:583-635` (hero CSS — `.hero-location`, `.hero-title`, `.hero-subtitle`, `.hero-actions`)

- [ ] **Step 1: Update hero location label CSS**

Replace the `.hero-location` block (lines 583-599) with new styling for "DESDE 1920" temporal context:

```css
    .hero-location {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.65rem;
      font-weight: 400;
      letter-spacing: 0.4em;
      text-transform: uppercase;
      color: rgba(201, 168, 76, 0.7);
      margin-bottom: 28px;
      opacity: 0;
      animation: fadeUp 1s var(--ease-out) 0.3s forwards;
    }
```

- [ ] **Step 2: Add social proof badge CSS**

After the `.hero-actions` block (after line 635), add the new social proof badge and secondary CTA link styles:

```css
    .hero-social-proof {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.05);
      padding: 10px 20px;
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      opacity: 0;
      animation: fadeUp 1s var(--ease-out) 1.1s forwards;
    }
    .hero-social-proof .stars {
      color: var(--gold);
      font-size: 0.85rem;
      letter-spacing: 2px;
    }
    .hero-social-proof .rating-text {
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    .hero-secondary-cta {
      font-size: 0.75rem;
      color: rgba(201, 168, 76, 0.6);
      letter-spacing: 0.1em;
      margin-top: 16px;
      opacity: 0;
      animation: fadeUp 1s var(--ease-out) 1s forwards;
    }
    .hero-secondary-cta a {
      color: var(--gold);
      border-bottom: 1px solid rgba(201, 168, 76, 0.3);
      padding-bottom: 2px;
      transition: all 0.3s;
    }
    .hero-secondary-cta a:hover {
      border-color: var(--gold);
    }
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(hero): add social proof badge and secondary CTA CSS styles"
```

---

### Task 2: Hero Cinematográfico — HTML

**Files:**
- Modify: `index.html:1977-2007` (hero HTML section)

- [ ] **Step 1: Replace hero HTML**

Replace the entire hero section (from `<!-- ===== HERO ===== -->` to closing `</section>` before the ornament) with:

```html
  <!-- ===== HERO ===== -->
  <section class="hero grain" id="hero">
    <div class="hero-bg">
      <img src="imagens/3fb6fdc9-4dee-400c-9052-e4e66d23acc7.png" alt="Interior do Marieta Bistrô com iluminação quente e paredes de tijolos expostos" loading="eager" id="heroImg">
    </div>
    <div class="hero-content">
      <div class="hero-location">
        DESDE 1920 · TAQUARITINGA, SP
      </div>
      <h1 class="hero-title">Onde a história<br>encontra o <em>sabor</em></h1>
      <p class="hero-subtitle">Um casarão centenário que guarda memórias de família e serve gastronomia autoral do Chef Ricardo Vagner.</p>
      <div class="hero-actions">
        <a href="https://wa.me/5516981488080?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20uma%20reserva%20no%20Marieta%20Bistr%C3%B4." target="_blank" rel="noopener" class="btn btn-primary">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          Reserve sua mesa
        </a>
      </div>
      <div class="hero-secondary-cta">
        ou <a href="#cardapio">explore o cardápio</a>
      </div>
      <div class="hero-social-proof">
        <span class="stars">★★★★★</span>
        <span class="rating-text">4.9 no Google · 128+ avaliações</span>
      </div>
    </div>
    <div class="hero-scroll">
      <span>Descubra</span>
      <div class="scroll-line"></div>
    </div>
  </section>
```

- [ ] **Step 2: Verify in browser**

Open `index.html` in the browser. The hero should now show:
- "DESDE 1920 · TAQUARITINGA, SP" as the location label (no SVG icon)
- "Onde a história encontra o sabor" as the headline
- Single primary CTA "Reserve sua mesa" button
- Secondary "ou explore o cardápio" text link below
- Social proof badge with stars and rating at bottom
- Scroll indicator still working

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(hero): update to cinematic storytelling hero with social proof"
```

---

### Task 3: Sobre — Timeline Narrativa (CSS)

**Files:**
- Modify: `index.html:672-765` (about CSS section)

- [ ] **Step 1: Replace about CSS**

Replace the entire about CSS block (from `/* ===== ABOUT ===== */` line 672 through line 765 ending before `/* ===== DIFERENCIAIS ===== */`) with:

```css
    /* ===== ABOUT ===== */
    .about {
      padding: 140px 0;
      background: var(--offwhite);
      position: relative;
    }

    .about .section-label { color: var(--wine); }
    .about .section-label::before { background: var(--wine); }
    .about .section-title { color: var(--text-dark); }
    .about .section-title em { color: var(--wine); }

    .about-header {
      text-align: center;
      max-width: 600px;
      margin: 0 auto 72px;
    }
    .about-header .section-label { justify-content: center; }
    .about-header .section-label::before { display: none; }

    .about-timeline {
      position: relative;
      max-width: 700px;
      margin: 0 auto;
      padding-left: 48px;
    }
    .about-timeline::before {
      content: '';
      position: absolute;
      left: 15px;
      top: 0;
      bottom: 0;
      width: 1px;
      background: linear-gradient(to bottom, var(--wine), rgba(107, 29, 42, 0.1));
    }

    .timeline-chapter {
      position: relative;
      margin-bottom: 56px;
    }
    .timeline-chapter:last-child {
      margin-bottom: 0;
    }
    .timeline-dot {
      position: absolute;
      left: -41px;
      top: 4px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--wine);
      border: 3px solid var(--offwhite);
      box-shadow: 0 0 0 2px var(--wine);
    }
    .timeline-chapter.current .timeline-dot {
      background: var(--gold);
      box-shadow: 0 0 0 2px var(--gold);
    }
    .timeline-era {
      font-family: var(--font-body);
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 6px;
    }
    .timeline-title {
      font-family: var(--font-display);
      font-size: 1.4rem;
      font-weight: 400;
      color: var(--text-dark);
      margin-bottom: 10px;
    }
    .timeline-text {
      font-size: 0.95rem;
      line-height: 1.8;
      color: var(--text-dark-secondary);
      font-weight: 300;
      margin-bottom: 16px;
    }
    .timeline-image {
      display: inline-block;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      border: 3px solid var(--offwhite);
      outline: 1px solid rgba(107, 29, 42, 0.1);
    }
    .timeline-image img {
      width: 220px;
      height: 150px;
      object-fit: cover;
      display: block;
      transition: transform 0.6s var(--ease-out);
    }
    .timeline-image:hover img {
      transform: scale(1.05);
    }
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat(about): add timeline narrative CSS styles"
```

---

### Task 4: Sobre — Timeline Narrativa (HTML)

**Files:**
- Modify: `index.html:2018-2044` (about HTML section)

- [ ] **Step 1: Replace about HTML**

Replace the entire about section (from `<!-- ===== SOBRE ===== -->` line 2018 through its closing `</section>` at line 2044) with:

```html
  <!-- ===== SOBRE ===== -->
  <section class="about" id="sobre">
    <div class="container">
      <div class="about-header">
        <div class="section-label reveal">Nossa História</div>
        <h2 class="section-title reveal reveal-delay-1">Três gerações, um mesmo<br><em>amor à mesa</em></h2>
      </div>
      <div class="about-timeline">
        <div class="timeline-chapter reveal">
          <div class="timeline-dot"></div>
          <div class="timeline-era">Década de 1920</div>
          <h3 class="timeline-title">A Vovó Marieta</h3>
          <p class="timeline-text">Dona Marieta, mulher italiana que transformava a cozinha em um lugar mágico, reunia a família ao redor da mesa com receitas que viraram tradição. O amor pela culinária passou de geração em geração.</p>
          <div class="timeline-image">
            <img src="imagens/historia-vo-marieta.jpg" alt="Vovó Marieta — a inspiração por trás do restaurante" loading="lazy">
          </div>
        </div>
        <div class="timeline-chapter reveal">
          <div class="timeline-dot"></div>
          <div class="timeline-era">O Casarão</div>
          <h3 class="timeline-title">Um centenário repaginado</h3>
          <p class="timeline-text">A casa do século XX — presente dado a Mayara, esposa do Chef, por seu avô Ibrahim Cheade — foi cuidadosamente restaurada, preservando a arquitetura original e trazendo conforto contemporâneo ao centro de Taquaritinga.</p>
          <div class="timeline-image">
            <img src="imagens/5e8f8d97-0c9d-4aa6-8140-c91f6b1ab8f5.png" alt="Fachada do casarão centenário do Marieta Bistrô" loading="lazy">
          </div>
        </div>
        <div class="timeline-chapter current reveal">
          <div class="timeline-dot"></div>
          <div class="timeline-era">Hoje</div>
          <h3 class="timeline-title">Chef Ricardo Vagner</h3>
          <p class="timeline-text">Neto primogênito da Vovó Marieta, o Chef Ricardo Vagner guardou consigo memórias que hoje moldam sua paixão pela culinária. Com técnica contemporânea e respeito pela tradição, transforma ingredientes regionais em pratos de conceito único.</p>
          <div class="timeline-image">
            <img src="imagens/afb4c45e-2913-4679-ae88-536df3d4e395.png" alt="Chef Ricardo Vagner na cozinha do Marieta Bistrô" loading="lazy">
          </div>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: Update responsive CSS for timeline**

In the responsive section at `@media (max-width: 1024px)` (line ~1880), replace the `.about-grid` rule:

Find: `.about-grid { grid-template-columns: 1fr; gap: 48px; }`
Replace with: `.about-timeline { padding-left: 40px; }`

In `@media (max-width: 640px)`, add after the existing rules:

```css
      .about-timeline { padding-left: 32px; }
      .timeline-image img { width: 180px; height: 120px; }
```

- [ ] **Step 3: Remove counter animation JS (no longer needed)**

In the JS section, remove the counter animation block (lines ~2631-2654):

Remove the entire block starting with `// ---- Counter animation ----` through the closing of `counterObserver.observe(counterEl);`.

- [ ] **Step 4: Verify in browser**

Open `index.html`. The Sobre section should show:
- Centered header: "Três gerações, um mesmo amor à mesa"
- Timeline with 3 chapters connected by a vertical wine-colored line
- Each chapter with era label, title, description, and contextual photo
- "Hoje" chapter has gold dot instead of wine

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat(about): replace grid layout with narrative timeline"
```

---

### Task 5: Cardápio — Visual Aprimorado (CSS + JS)

**Files:**
- Modify: `index.html:1017-1039` (menu tab CSS)
- Modify: `index.html:2656-2739` (renderCardapio function)

- [ ] **Step 1: Update menu tab CSS**

Replace the `.menu-tab` CSS (lines 1017-1039) with:

```css
    .menu-tab {
      padding: 10px 20px;
      font-family: var(--font-body);
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-muted);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.4s var(--ease-out);
    }
    .menu-tab:hover {
      color: var(--cream);
      border-color: rgba(201, 168, 76, 0.25);
    }
    .menu-tab.active {
      background: rgba(107, 29, 42, 0.8);
      color: var(--cream);
      border-color: rgba(201, 168, 76, 0.2);
    }
```

- [ ] **Step 2: Add menu item badge CSS**

After the `.menu-list-note` CSS block (line ~1209), add:

```css
    .menu-list-item-badge {
      display: inline-block;
      margin-top: 6px;
      font-size: 0.65rem;
      background: rgba(201, 168, 76, 0.1);
      color: var(--gold);
      padding: 3px 10px;
      border-radius: 12px;
      letter-spacing: 0.05em;
    }
```

- [ ] **Step 3: Update renderCardapio function with emoji tabs and badge support**

Replace the `renderCardapio` function (lines 2656-2739) with:

```javascript
    function renderCardapio(cardapioData) {
      var tabsContainer = document.getElementById('menuTabs');
      var panelsContainer = document.getElementById('menuPanels');

      var emojiMap = {
        'entradas': '🍽',
        'massas': '🍝',
        'carnes': '🥩',
        'peixes': '🐟',
        'risotos': '🍚',
        'sobremesas': '🍰',
        'drinks': '🍸',
        'bebidas': '🍷'
      };

      cardapioData.forEach(function(tab, tabIndex) {
        var btn = document.createElement('button');
        btn.className = 'menu-tab' + (tabIndex === 0 ? ' active' : '');
        var emoji = emojiMap[tab.id] || '';
        btn.textContent = (emoji ? emoji + ' ' : '') + tab.label;
        btn.addEventListener('click', function() {
          document.querySelectorAll('.menu-panel').forEach(function(p) { p.classList.remove('active'); });
          document.querySelectorAll('.menu-tab').forEach(function(t) { t.classList.remove('active'); });
          document.getElementById('panel-' + tab.id).classList.add('active');
          btn.classList.add('active');
          document.querySelectorAll('#panel-' + tab.id + ' .reveal').forEach(function(el) {
            el.classList.remove('visible');
            setTimeout(function() { el.classList.add('visible'); }, 50);
          });
        });
        tabsContainer.appendChild(btn);

        var panel = document.createElement('div');
        panel.className = 'menu-panel' + (tabIndex === 0 ? ' active' : '');
        panel.id = 'panel-' + tab.id;

        var list = document.createElement('div');
        list.className = 'menu-list';

        tab.categorias.forEach(function(cat) {
          var catDiv = document.createElement('div');
          catDiv.className = 'menu-list-category';

          var title = document.createElement('h3');
          title.className = 'menu-list-category-title reveal';
          title.textContent = cat.titulo;
          catDiv.appendChild(title);

          cat.itens.forEach(function(item) {
            var itemDiv = document.createElement('div');
            itemDiv.className = 'menu-list-item reveal';

            var header = document.createElement('div');
            header.className = 'menu-list-item-header';

            var name = document.createElement('span');
            name.className = 'menu-list-item-name';
            name.textContent = item.nome;
            header.appendChild(name);

            if (item.preco && item.preco > 0) {
              var dots = document.createElement('span');
              dots.className = 'menu-list-item-dots';
              header.appendChild(dots);

              var price = document.createElement('span');
              price.className = 'menu-list-item-price';
              price.textContent = 'R$' + Number(item.preco).toFixed(2).replace('.', ',');
              header.appendChild(price);
            }

            itemDiv.appendChild(header);

            if (item.desc) {
              var desc = document.createElement('p');
              desc.className = 'menu-list-item-desc';
              desc.textContent = item.desc;
              itemDiv.appendChild(desc);
            }

            if (item.destaque) {
              var badge = document.createElement('span');
              badge.className = 'menu-list-item-badge';
              badge.textContent = '✨ Favorito do Chef';
              itemDiv.appendChild(badge);
            }

            catDiv.appendChild(itemDiv);
          });

          if (cat.nota) {
            var nota = document.createElement('p');
            nota.className = 'menu-list-note reveal';
            nota.textContent = cat.nota;
            catDiv.appendChild(nota);
          }

          list.appendChild(catDiv);
        });

        panel.appendChild(list);
        panelsContainer.appendChild(panel);
      });
    }
```

- [ ] **Step 4: Verify in browser**

Open `index.html`. The cardápio should show:
- Tabs with emojis and square border-radius (8px)
- Active tab has wine background instead of gold outline
- Items render normally (badge only shows if `destaque` field exists in Firestore data)

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat(menu): add emoji tabs, square radius, and chef badge support"
```

---

### Task 6: Galeria — Layout Editorial Masonry

**Files:**
- Modify: `index.html:877-928` (gallery grid CSS)
- Modify: `index.html:2134-2156` (gallery HTML)
- Modify: `index.html:1887-1893` (gallery responsive CSS)
- Modify: `index.html:1908-1918` (gallery mobile CSS)

- [ ] **Step 1: Update gallery grid CSS**

Replace the gallery grid and item nth-child CSS (lines 877-928) with:

```css
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: auto auto auto;
      gap: 16px;
    }

    .gallery-item {
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .gallery-item img {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: transform 0.8s var(--ease-out);
    }
    .gallery-item::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 50%, rgba(26,18,16,0.4) 100%);
      opacity: 0;
      transition: opacity 0.5s;
    }
    .gallery-item:hover img {
      transform: scale(1.06);
    }
    .gallery-item:hover::after { opacity: 1; }

    .gallery-caption {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 20px;
      z-index: 2;
      opacity: 0;
      transform: translateY(8px);
      transition: all 0.5s var(--ease-out);
    }
    .gallery-item:hover .gallery-caption {
      opacity: 1;
      transform: translateY(0);
    }
    .gallery-caption-label {
      font-size: 0.6rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(201, 168, 76, 0.8);
      margin-bottom: 4px;
    }
    .gallery-caption-title {
      font-family: var(--font-display);
      font-size: 1.1rem;
      color: var(--cream);
    }

    /* Masonry layout */
    .gallery-item:nth-child(1) {
      grid-column: span 2;
      aspect-ratio: 16/9;
    }
    .gallery-item:nth-child(2) {
      grid-row: span 2;
    }
    .gallery-item:nth-child(3) {
      aspect-ratio: 1;
    }
    .gallery-item:nth-child(4) {
      aspect-ratio: 1;
    }
    .gallery-item:nth-child(5) {
      grid-column: span 3;
      aspect-ratio: 3/1;
    }
```

- [ ] **Step 2: Replace gallery HTML**

Replace the gallery section HTML (from `<!-- ===== GALERIA ===== -->` through its `</section>` — the `<section class="gallery">` block, lines ~2134-2156) with:

```html
  <section class="gallery" id="galeria">
    <div class="container">
      <div class="gallery-header">
        <div class="section-label reveal">Galeria</div>
        <h2 class="section-title reveal reveal-delay-1">Momentos que <em>inspiram</em></h2>
      </div>
      <div class="gallery-grid">
        <div class="gallery-item reveal" onclick="openLightbox(this)">
          <img src="imagens/3fb6fdc9-4dee-400c-9052-e4e66d23acc7.png" alt="Salão principal do Marieta Bistrô" loading="lazy">
          <div class="gallery-caption">
            <div class="gallery-caption-label">O Ambiente</div>
            <div class="gallery-caption-title">Salão principal</div>
          </div>
        </div>
        <div class="gallery-item reveal reveal-delay-1" onclick="openLightbox(this)">
          <img src="imagens/afb4c45e-2913-4679-ae88-536df3d4e395.png" alt="Chef Ricardo Vagner" loading="lazy">
          <div class="gallery-caption">
            <div class="gallery-caption-label">O Chef</div>
            <div class="gallery-caption-title">Ricardo Vagner</div>
          </div>
        </div>
        <div class="gallery-item reveal reveal-delay-2" onclick="openLightbox(this)">
          <img src="imagens/5e8f8d97-0c9d-4aa6-8140-c91f6b1ab8f5.png" alt="Fachada do Marieta Bistrô à noite" loading="lazy">
          <div class="gallery-caption">
            <div class="gallery-caption-label">A Fachada</div>
            <div class="gallery-caption-title">Centenário iluminado</div>
          </div>
        </div>
        <div class="gallery-item reveal reveal-delay-3" onclick="openLightbox(this)">
          <img src="imagens/historia-familia.jpg" alt="História da família por trás do Marieta Bistrô" loading="lazy">
          <div class="gallery-caption">
            <div class="gallery-caption-label">A Família</div>
            <div class="gallery-caption-title">Raízes e tradição</div>
          </div>
        </div>
        <div class="gallery-item reveal reveal-delay-4" onclick="openLightbox(this)">
          <img src="imagens/d9800dee-fbec-4402-afb8-f9d980ac2381.png" alt="Bar e atmosfera do Marieta Bistrô" loading="lazy">
          <div class="gallery-caption">
            <div class="gallery-caption-label">A Cozinha</div>
            <div class="gallery-caption-title">Nos bastidores</div>
          </div>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **Step 3: Update responsive CSS for gallery**

In `@media (max-width: 1024px)`, replace the gallery rules (lines ~1887-1893) with:

```css
      .gallery-grid { grid-template-columns: 1fr 1fr; }
      .gallery-item:nth-child(1) { grid-column: span 2; }
      .gallery-item:nth-child(2) { grid-row: auto; }
      .gallery-item:nth-child(5) { grid-column: span 2; }
```

In `@media (max-width: 640px)`, replace the gallery rules (lines ~1908-1918) with:

```css
      .gallery-grid { grid-template-columns: 1fr; }
      .gallery-item:nth-child(1),
      .gallery-item:nth-child(2),
      .gallery-item:nth-child(3),
      .gallery-item:nth-child(4),
      .gallery-item:nth-child(5) {
        grid-column: auto;
        grid-row: auto;
        aspect-ratio: 16/10;
      }
      .gallery-caption { opacity: 1; transform: translateY(0); }
```

- [ ] **Step 4: Verify in browser**

Open `index.html`. Gallery should show:
- Masonry layout with 5 images in varied sizes
- First image spans 2 columns (16:9), second spans 2 rows (vertical), last spans full width (3:1)
- Captions appear on hover with label + title
- Lightbox still works on click
- Mobile: single column, captions always visible

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat(gallery): editorial masonry layout with captions"
```

---

### Task 7: Depoimentos — Carrossel com Prova Social

**Files:**
- Modify: `index.html:1388-1482` (testimonials CSS)
- Modify: `index.html:2194-2255` (testimonials HTML)
- Add JS for carousel auto-play (after lightbox JS)

- [ ] **Step 1: Replace testimonials CSS**

Replace the entire testimonials CSS block (lines 1388-1482, from `/* ===== TESTIMONIALS ===== */` to just before `/* ===== EXPERIENCE / CONVITE ===== */`) with:

```css
    /* ===== TESTIMONIALS ===== */
    .testimonials {
      padding: 120px 0;
      background: var(--dark-warm);
      position: relative;
    }
    .testimonials::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at 30% 0%, rgba(107, 29, 42, 0.1), transparent 50%),
        radial-gradient(ellipse at 70% 100%, rgba(201, 168, 76, 0.06), transparent 50%);
    }

    .testimonials-header {
      text-align: center;
      max-width: 600px;
      margin: 0 auto 48px;
      position: relative;
      z-index: 2;
    }
    .testimonials-header .section-label { justify-content: center; }
    .testimonials-header .section-label::before { display: none; }

    .testimonials-google-badge {
      display: inline-flex;
      align-items: center;
      gap: 14px;
      background: rgba(255, 255, 255, 0.04);
      padding: 14px 28px;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      margin-bottom: 48px;
      position: relative;
      z-index: 2;
    }
    .testimonials-google-badge .badge-score {
      font-family: var(--font-display);
      font-size: 1.6rem;
      font-weight: 300;
      color: var(--cream);
    }
    .testimonials-google-badge .badge-stars {
      color: var(--gold);
      font-size: 0.85rem;
      letter-spacing: 2px;
    }
    .testimonials-google-badge .badge-count {
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    .testimonials-carousel {
      position: relative;
      z-index: 2;
      max-width: 680px;
      margin: 0 auto;
      overflow: hidden;
    }
    .testimonials-track {
      display: flex;
      transition: transform 0.6s var(--ease-out);
    }
    .testimonial-slide {
      min-width: 100%;
      padding: 0 16px;
      box-sizing: border-box;
    }
    .testimonial-card {
      padding: 48px 44px;
      background: rgba(107, 29, 42, 0.1);
      border: 1px solid rgba(107, 29, 42, 0.2);
      border-radius: 20px;
      text-align: center;
      position: relative;
    }
    .testimonial-quote-mark {
      font-family: var(--font-display);
      font-size: 4rem;
      color: rgba(201, 168, 76, 0.15);
      position: absolute;
      top: 12px;
      left: 28px;
      line-height: 1;
    }
    .testimonial-text {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-style: italic;
      line-height: 1.7;
      color: var(--cream-warm);
      margin-bottom: 28px;
      padding: 0 16px;
    }
    .testimonial-author {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .testimonial-avatar {
      width: 44px; height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--wine), var(--terracotta));
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-size: 1.1rem;
      color: var(--cream);
      flex-shrink: 0;
    }
    .testimonial-name {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--cream);
    }
    .testimonial-role {
      font-size: 0.72rem;
      color: var(--text-muted);
      margin-top: 2px;
    }
    .testimonials-dots {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 32px;
      position: relative;
      z-index: 2;
    }
    .testimonials-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      border: none;
      cursor: pointer;
      transition: all 0.3s;
      padding: 0;
    }
    .testimonials-dot.active {
      width: 24px;
      border-radius: 4px;
      background: var(--gold);
    }
```

- [ ] **Step 2: Replace testimonials HTML**

Replace the testimonials section HTML (from `<section class="testimonials"` through its `</section>`) with:

```html
  <section class="testimonials grain" id="depoimentos">
    <div class="container">
      <div class="testimonials-header">
        <div class="section-label reveal">Depoimentos</div>
        <h2 class="section-title reveal reveal-delay-1">O que dizem nossos <em>convidados</em></h2>
      </div>
      <div style="text-align:center;" class="reveal reveal-delay-2">
        <div class="testimonials-google-badge">
          <div class="badge-score">4.9</div>
          <div>
            <div class="badge-stars">★★★★★</div>
            <div class="badge-count">128+ avaliações no Google</div>
          </div>
        </div>
      </div>
      <div class="testimonials-carousel reveal reveal-delay-3" id="testimonialCarousel">
        <div class="testimonials-track" id="testimonialTrack">
          <div class="testimonial-slide">
            <div class="testimonial-card">
              <div class="testimonial-quote-mark">"</div>
              <p class="testimonial-text">"Ambiente aconchegante, funcionários atenciosos e a comida é deliciosa."</p>
              <div class="testimonial-author">
                <div class="testimonial-avatar">A</div>
                <div style="text-align:left;">
                  <div class="testimonial-name">Ana Rita Mazza</div>
                  <div class="testimonial-role">Avaliação Google</div>
                </div>
              </div>
            </div>
          </div>
          <div class="testimonial-slide">
            <div class="testimonial-card">
              <div class="testimonial-quote-mark">"</div>
              <p class="testimonial-text">"Por ser um bistrô de interior, entrega pratos de conceito ímpar!"</p>
              <div class="testimonial-author">
                <div class="testimonial-avatar">M</div>
                <div style="text-align:left;">
                  <div class="testimonial-name">Maria Fernanda Jacob</div>
                  <div class="testimonial-role">Avaliação Google</div>
                </div>
              </div>
            </div>
          </div>
          <div class="testimonial-slide">
            <div class="testimonial-card">
              <div class="testimonial-quote-mark">"</div>
              <p class="testimonial-text">"Atendimento excelente, ótimas opções no cardápio e ambiente aconchegante."</p>
              <div class="testimonial-author">
                <div class="testimonial-avatar">N</div>
                <div style="text-align:left;">
                  <div class="testimonial-name">Natália Amoroso</div>
                  <div class="testimonial-role">Avaliação Google</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="testimonials-dots" id="testimonialDots">
        <button class="testimonials-dot active" data-slide="0" aria-label="Depoimento 1"></button>
        <button class="testimonials-dot" data-slide="1" aria-label="Depoimento 2"></button>
        <button class="testimonials-dot" data-slide="2" aria-label="Depoimento 3"></button>
      </div>
    </div>
  </section>
```

- [ ] **Step 3: Update responsive CSS for testimonials**

In `@media (max-width: 1024px)`, replace:
`.testimonials-grid { grid-template-columns: 1fr; max-width: 600px; margin: 0 auto; }`

with:
`.testimonials-carousel { max-width: 100%; }`

- [ ] **Step 4: Add carousel JS**

After the lightbox JS section (after `document.addEventListener('keydown'...` at line ~2759), add:

```javascript
    // ---- Testimonials Carousel ----
    (function() {
      var track = document.getElementById('testimonialTrack');
      var dots = document.querySelectorAll('.testimonials-dot');
      var carousel = document.getElementById('testimonialCarousel');
      if (!track || !dots.length) return;

      var currentSlide = 0;
      var totalSlides = dots.length;
      var autoplayTimer;

      function goToSlide(index) {
        currentSlide = index;
        track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
        dots.forEach(function(d, i) {
          d.classList.toggle('active', i === currentSlide);
        });
      }

      function nextSlide() {
        goToSlide((currentSlide + 1) % totalSlides);
      }

      function startAutoplay() {
        autoplayTimer = setInterval(nextSlide, 5000);
      }

      function stopAutoplay() {
        clearInterval(autoplayTimer);
      }

      dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
          goToSlide(parseInt(this.getAttribute('data-slide')));
          stopAutoplay();
          startAutoplay();
        });
      });

      carousel.addEventListener('mouseenter', stopAutoplay);
      carousel.addEventListener('mouseleave', startAutoplay);

      startAutoplay();
    })();
```

- [ ] **Step 5: Verify in browser**

- Google badge shows "4.9 ★★★★★ 128+ avaliações"
- Carousel auto-plays every 5 seconds
- Dots update with active state (pill shape, gold)
- Hovering pauses auto-play
- Clicking dots navigates to specific slide

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat(testimonials): carousel with Google social proof badge"
```

---

### Task 8: Eventos — Cards Modernizados

**Files:**
- Modify: `index.html:1257-1340` (events CSS)
- Modify: `index.html:2257-2295` (events HTML)

- [ ] **Step 1: Update event card CSS**

In the events CSS, add after `.event-desc` (line ~1311):

```css
    .event-cta-link {
      display: inline-block;
      margin-top: 20px;
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--wine);
      transition: all 0.3s;
    }
    .event-cta-link:hover {
      color: var(--wine-deep);
      transform: translateX(4px);
    }
```

Update `.event-icon` (line ~1282) — change `border-radius: 14px` to `border-radius: 12px`.

- [ ] **Step 2: Replace events HTML**

Replace the events section HTML (from `<!-- ===== EVENTOS ===== -->` through its `</section>`) with:

```html
  <!-- ===== EVENTOS ===== -->
  <section class="events" id="eventos">
    <div class="container">
      <div class="events-header">
        <div class="section-label reveal">Eventos</div>
        <h2 class="section-title reveal reveal-delay-1">Celebre no <em>Marieta</em></h2>
        <p class="events-subtitle reveal reveal-delay-2">Transformamos momentos especiais em experiências gastronômicas inesquecíveis. Nosso espaço e equipe estão prontos para tornar seu evento único.</p>
      </div>
      <div class="events-grid">
        <div class="event-card reveal">
          <div class="event-icon"><span style="font-size:1.6rem;">🍽</span></div>
          <h3 class="event-title">Jantares Corporativos</h3>
          <p class="event-desc">Ambiente sofisticado para confraternizações, reuniões de negócios e eventos empresariais com menu exclusivo.</p>
          <a href="https://wa.me/5516981488080?text=Ol%C3%A1!%20Gostaria%20de%20saber%20sobre%20jantares%20corporativos%20no%20Marieta%20Bistr%C3%B4." target="_blank" rel="noopener" class="event-cta-link">SOLICITAR →</a>
        </div>
        <div class="event-card reveal reveal-delay-1">
          <div class="event-icon"><span style="font-size:1.6rem;">🎂</span></div>
          <h3 class="event-title">Aniversários & Comemorações</h3>
          <p class="event-desc">Celebre datas especiais com um menu degustação personalizado e decoração que reflete a ocasião.</p>
          <a href="https://wa.me/5516981488080?text=Ol%C3%A1!%20Gostaria%20de%20saber%20sobre%20anivers%C3%A1rios%20e%20comemora%C3%A7%C3%B5es%20no%20Marieta%20Bistr%C3%B4." target="_blank" rel="noopener" class="event-cta-link">SOLICITAR →</a>
        </div>
        <div class="event-card reveal reveal-delay-2">
          <div class="event-icon"><span style="font-size:1.6rem;">🍷</span></div>
          <h3 class="event-title">Eventos Privados</h3>
          <p class="event-desc">Espaço reservado para grupos de até 60 pessoas, com atendimento exclusivo e cardápio sob medida.</p>
          <a href="https://wa.me/5516981488080?text=Ol%C3%A1!%20Gostaria%20de%20saber%20sobre%20eventos%20privados%20no%20Marieta%20Bistr%C3%B4." target="_blank" rel="noopener" class="event-cta-link">SOLICITAR →</a>
        </div>
      </div>
    </div>
  </section>
```

Note: The generic "Solicitar Orçamento" CTA at the bottom is removed. Each card now has its own specific CTA.

- [ ] **Step 3: Remove unused `.events-cta` and `.btn-wine` CSS**

The `.events-cta` CSS (lines 1312-1315) and `.btn-wine` CSS (lines 1316-1340) are no longer needed. Remove them.

- [ ] **Step 4: Verify in browser**

- Cards show emoji icons (🍽, 🎂, 🍷) instead of SVG icons
- Each card has "SOLICITAR →" link pointing to WhatsApp with event-specific message
- No generic "Solicitar Orçamento" button at bottom
- Hover still lifts cards and shows top border gradient

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat(events): emoji icons and individual WhatsApp CTAs per card"
```

---

### Task 9: Performance — Preloader Inteligente

**Files:**
- Modify: `index.html:2489-2494` (preloader JS)

- [ ] **Step 1: Replace preloader JS**

Replace the preloader JS block (lines 2489-2494) with:

```javascript
    // ---- Preloader (smart: based on real load, max 3s) ----
    (function() {
      var preloader = document.getElementById('preloader');
      var maxTimeout = setTimeout(function() {
        preloader.classList.add('hidden');
      }, 3000);

      window.addEventListener('load', function() {
        clearTimeout(maxTimeout);
        // Small delay for animation completion
        setTimeout(function() {
          preloader.classList.add('hidden');
        }, 600);
      });
    })();
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "perf(preloader): smart load-based preloader with 3s max timeout"
```

---

### Task 10: Performance — Google Maps Lazy Load

**Files:**
- Modify: `index.html:2421-2429` (maps iframe HTML)
- Add JS for lazy loading maps (in script section)

- [ ] **Step 1: Update maps iframe HTML**

Replace the contact-map div (lines ~2421-2429) with:

```html
        <div class="contact-map reveal reveal-delay-3" id="contactMap">
          <div style="width:100%;height:100%;background:var(--beige);display:flex;align-items:center;justify-content:center;">
            <span style="font-size:0.8rem;color:var(--text-dark-secondary);">Carregando mapa...</span>
          </div>
        </div>
```

- [ ] **Step 2: Add maps lazy load JS**

At the end of the JS section (before `</script>`), add:

```javascript
    // ---- Lazy load Google Maps ----
    (function() {
      var mapContainer = document.getElementById('contactMap');
      if (!mapContainer) return;

      var mapObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var iframe = document.createElement('iframe');
            iframe.src = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3718.5!2d-48.5094!3d-21.4050!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDI0JzE4LjAiUyA0OMKwMzAnMzQuMCJX!5e0!3m2!1spt-BR!2sbr!4v1';
            iframe.allowFullscreen = true;
            iframe.loading = 'lazy';
            iframe.referrerPolicy = 'no-referrer-when-downgrade';
            iframe.title = 'Localização do Marieta Bistrô';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = '0';
            iframe.style.filter = 'saturate(0.8) brightness(0.95)';
            iframe.style.transition = 'filter 0.5s';
            mapContainer.innerHTML = '';
            mapContainer.appendChild(iframe);
            mapContainer.addEventListener('mouseenter', function() { iframe.style.filter = 'saturate(1) brightness(1)'; });
            mapContainer.addEventListener('mouseleave', function() { iframe.style.filter = 'saturate(0.8) brightness(0.95)'; });
            mapObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '200px' });

      mapObserver.observe(mapContainer);
    })();
```

- [ ] **Step 3: Verify in browser**

- Scroll to the contact section
- Map should load only when the contact section is near the viewport
- Before loading, a "Carregando mapa..." placeholder is shown
- Hover filter effects work after load

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "perf(maps): lazy load Google Maps iframe on scroll"
```

---

### Task 11: Performance — Image Optimization

**Files:**
- Convert images in `imagens/` directory to WebP

- [ ] **Step 1: Check if cwebp is available, install if needed**

```bash
which cwebp || echo "cwebp not found"
```

If not found, skip WebP conversion and add a note. The images can be converted manually later. If available, proceed:

- [ ] **Step 2: Convert PNG images to WebP**

```bash
cd imagens
for f in *.png; do cwebp -q 80 "$f" -o "${f%.png}.webp"; done
```

- [ ] **Step 3: Convert JPG images to WebP**

```bash
for f in *.jpg; do cwebp -q 80 "$f" -o "${f%.jpg}.webp"; done
```

- [ ] **Step 4: Update HTML to use `<picture>` elements with WebP fallback**

For each `<img>` tag in the HTML, wrap with `<picture>` for WebP support. Example for the hero image:

Replace:
```html
<img src="imagens/3fb6fdc9-4dee-400c-9052-e4e66d23acc7.png" alt="..." loading="eager" id="heroImg">
```

With:
```html
<picture>
  <source srcset="imagens/3fb6fdc9-4dee-400c-9052-e4e66d23acc7.webp" type="image/webp">
  <img src="imagens/3fb6fdc9-4dee-400c-9052-e4e66d23acc7.png" alt="..." loading="eager" id="heroImg">
</picture>
```

Apply the same pattern to ALL `<img>` tags in the gallery, about timeline, experience section, and Instagram section. Keep original `loading`, `alt`, and `id` attributes on the `<img>` fallback.

- [ ] **Step 5: Verify WebP files are smaller**

```bash
ls -la imagens/*.webp imagens/*.png imagens/*.jpg
```

Expected: WebP files should be 60-70% smaller than originals.

- [ ] **Step 6: Commit**

```bash
git add imagens/*.webp index.html
git commit -m "perf(images): add WebP versions with picture fallback"
```

---

### Task 12: Final Verification

- [ ] **Step 1: Open index.html in browser and verify all sections**

Check each section visually:
1. Hero — new headline, single CTA, social proof badge, scroll indicator
2. Sobre — timeline with 3 chapters, wine/gold dots
3. Cardápio — emoji tabs, square radius, items load from Firestore/fallback
4. Galeria — masonry layout, 5 images, captions on hover, lightbox works
5. Depoimentos — Google badge, carousel auto-plays, dots work
6. Eventos — emoji icons, individual CTAs, no generic bottom button
7. Contato — maps lazy loads on scroll
8. Preloader — dismisses on real load or 3s max

- [ ] **Step 2: Test responsive (mobile 375px)**

Resize browser to 375px width:
- Hero: actions stack vertically
- About: timeline left padding reduces
- Gallery: single column, captions visible
- Testimonials: carousel works on mobile
- Events: single column cards

- [ ] **Step 3: Test responsive (tablet 768px)**

Resize browser to 768px width:
- Gallery: 2 columns
- Events: 2 columns
- About: timeline reduces padding

- [ ] **Step 4: Test all WhatsApp links**

Click every WhatsApp CTA and verify the pre-filled messages are correct:
- Hero: general reservation
- Events corporate: mention "jantares corporativos"
- Events birthday: mention "aniversários e comemorações"
- Events private: mention "eventos privados"
- Floating button: general reservation

- [ ] **Step 5: Commit all final adjustments**

```bash
git add index.html
git commit -m "chore: final adjustments after verification"
```

---

## Summary of Changes

| Task | Section | Type |
|------|---------|------|
| 1-2 | Hero | CSS + HTML |
| 3-4 | Sobre/Timeline | CSS + HTML + JS cleanup |
| 5 | Cardápio | CSS + JS |
| 6 | Galeria | CSS + HTML + responsive |
| 7 | Depoimentos | CSS + HTML + JS |
| 8 | Eventos | CSS + HTML |
| 9 | Preloader | JS |
| 10 | Google Maps | HTML + JS |
| 11 | Imagens | WebP conversion + HTML |
| 12 | Verification | Manual testing |
