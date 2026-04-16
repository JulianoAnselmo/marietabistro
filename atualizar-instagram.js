/**
 * Script para baixar as 9 ultimas postagens do Instagram do @marieta_bistro
 * Acessa Instagram diretamente com Puppeteer + Stealth (sem login)
 *
 * Como usar:
 *   node atualizar-instagram.js
 *
 * As imagens sao salvas em imagens/instagram/post_1.jpg ... post_9.jpg
 * e os metadados em imagens/instagram/posts.json
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const PROFILE = 'marieta_bistro';
const OUTPUT_DIR = path.join(__dirname, 'imagens', 'instagram');
const POSTS_JSON = path.join(OUTPUT_DIR, 'posts.json');
const MAX_POSTS = 9;

async function downloadImage(browser, imgSrc, dest) {
  const imgPage = await browser.newPage();
  try {
    const response = await imgPage.goto(imgSrc, { waitUntil: 'load', timeout: 15000 });
    if (response && response.ok()) {
      const buffer = await response.buffer();
      fs.writeFileSync(dest, buffer);
    } else {
      throw new Error('HTTP ' + (response ? response.status() : 'null'));
    }
  } finally {
    await imgPage.close();
  }
}

(async () => {
  console.log('Abrindo navegador...');
  // Detecta se esta rodando no CI (GitHub Actions) ou local
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  const browser = await puppeteer.launch({
    headless: isCI ? 'new' : false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    console.log('Acessando perfil @' + PROFILE + ' no Instagram...');
    await page.goto('https://www.instagram.com/' + PROFILE + '/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await new Promise(r => setTimeout(r, 3000));

    // Fechar modal de login se aparecer
    try {
      const closeBtn = await page.$('[aria-label="Fechar"], [aria-label="Close"], button svg[aria-label="Fechar"]');
      if (closeBtn) {
        await closeBtn.click();
        console.log('Modal de login fechado.');
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch(e) {}

    // Tentar fechar clicando no X do modal
    try {
      await page.evaluate(() => {
        const btns = document.querySelectorAll('button');
        for (const btn of btns) {
          if (btn.querySelector('svg') && btn.closest('[role="dialog"]')) {
            btn.click();
            break;
          }
        }
      });
      await new Promise(r => setTimeout(r, 1000));
    } catch(e) {}

    // Scroll para carregar posts
    await page.evaluate(() => window.scrollBy(0, 600));
    await new Promise(r => setTimeout(r, 2000));

    // Extrair URLs das imagens dos posts (grid de 3 colunas do Instagram)
    console.log('Extraindo posts...');
    const posts = await page.evaluate((max) => {
      // Instagram usa <article> para o grid de posts
      const article = document.querySelector('article') || document.querySelector('main');
      if (!article) return [];

      // Pegar todas as imagens dentro do grid de posts
      const allImgs = article.querySelectorAll('img');
      const results = [];
      const seen = new Set();

      for (const img of allImgs) {
        const src = img.getAttribute('src') || '';
        if (!src || src.includes('profile') || src.includes('44x44') || src.includes('150x150')) continue;
        if (seen.has(src)) continue;
        seen.add(src);

        const link = img.closest('a');
        results.push({
          imageUrl: src,
          postUrl: link ? link.getAttribute('href') || '' : '',
          alt: img.getAttribute('alt') || ''
        });

        if (results.length >= max) break;
      }
      return results;
    }, MAX_POSTS);

    // Diagnostico: sempre logar contexto da pagina
    const pageTitle = await page.title();
    const pageUrl = page.url();
    const htmlLen = (await page.content()).length;
    const domInfo = await page.evaluate(() => ({
      hasArticle: !!document.querySelector('article'),
      hasMain: !!document.querySelector('main'),
      totalImgs: document.querySelectorAll('img').length,
      bodyTextSample: (document.body ? document.body.innerText : '').slice(0, 200)
    }));
    console.log('--- DIAGNOSTICO ---');
    console.log('URL final:   ' + pageUrl);
    console.log('Titulo:      ' + pageTitle);
    console.log('HTML bytes:  ' + htmlLen);
    console.log('hasArticle:  ' + domInfo.hasArticle);
    console.log('hasMain:     ' + domInfo.hasMain);
    console.log('totalImgs:   ' + domInfo.totalImgs);
    console.log('bodyText:    ' + domInfo.bodyTextSample.replace(/\s+/g, ' '));
    console.log('-------------------');
    console.log('Encontrados ' + posts.length + ' posts.');

    if (posts.length === 0) {
      if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      }
      // Salvar screenshot e HTML para debug
      try {
        await page.screenshot({ path: path.join(OUTPUT_DIR, 'debug.png'), fullPage: true });
        fs.writeFileSync(path.join(OUTPUT_DIR, 'debug.html'), await page.content());
        console.log('Debug salvo em imagens/instagram/debug.png e debug.html');
      } catch (e) {
        console.error('Falha ao salvar debug artifacts: ' + e.message);
      }
      await browser.close();
      console.error('ERRO: Nenhum post foi extraido da pagina. Saindo com exit 1.');
      process.exit(1);
    }

    console.log('Baixando imagens...');

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const postsData = [];

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const filename = 'post_' + (i + 1) + '.jpg';
      const filepath = path.join(OUTPUT_DIR, filename);

      try {
        await downloadImage(browser, post.imageUrl, filepath);
        const stats = fs.statSync(filepath);
        console.log('  [' + (i + 1) + '/' + posts.length + '] ' + filename + ' (' + Math.round(stats.size / 1024) + 'KB)');

        postsData.push({
          image: 'imagens/instagram/' + filename,
          postUrl: post.postUrl ? 'https://www.instagram.com' + post.postUrl : 'https://www.instagram.com/' + PROFILE + '/',
          alt: post.alt || 'Post do @' + PROFILE,
          index: i + 1
        });
      } catch (err) {
        console.error('  [' + (i + 1) + '] Erro: ' + err.message);
      }
    }

    // Salvar metadados JSON
    const meta = {
      profile: PROFILE,
      updatedAt: new Date().toISOString(),
      posts: postsData
    };
    fs.writeFileSync(POSTS_JSON, JSON.stringify(meta, null, 2));

    // Atualizar dados inline no index.html (entre marcadores)
    const indexPath = path.join(__dirname, 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');
    const startMarker = '/* INSTAGRAM-POSTS-START */';
    const endMarker = '/* INSTAGRAM-POSTS-END */';
    const startIdx = html.indexOf(startMarker);
    const endIdx = html.indexOf(endMarker);

    if (startIdx !== -1 && endIdx !== -1) {
      const jsData = postsData.map(function(p) {
        return { image: p.image, postUrl: p.postUrl, alt: 'Post do @' + PROFILE };
      });
      const newBlock = startMarker + '\n  var instagramPosts = ' + JSON.stringify(jsData) + ';\n  ' + endMarker;
      html = html.substring(0, startIdx) + newBlock + html.substring(endIdx + endMarker.length);
      fs.writeFileSync(indexPath, html);
      console.log('\nindex.html atualizado com novos posts.');
    }

    // Salvar arquivo JS externo tambem (backup)
    const jsData2 = postsData.map(function(p) {
      return { image: p.image, postUrl: p.postUrl, alt: 'Post do @' + PROFILE };
    });
    fs.writeFileSync(path.join(__dirname, 'instagram-posts.js'), 'var instagramPosts = ' + JSON.stringify(jsData2, null, 2) + ';\n');

    console.log('Sucesso! ' + postsData.length + ' imagens dos ultimos posts do @' + PROFILE);

  } catch (err) {
    console.error('Erro: ' + err.message);
    console.error(err.stack);
    try {
      if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      }
      const pages = await browser.pages();
      const p = pages[0];
      if (p) {
        await p.screenshot({ path: path.join(OUTPUT_DIR, 'debug.png'), fullPage: true });
        fs.writeFileSync(path.join(OUTPUT_DIR, 'debug.html'), await p.content());
        console.log('Screenshot e HTML de debug salvos.');
      }
    } catch(e) {
      console.error('Falha ao salvar debug: ' + e.message);
    }
    await browser.close();
    process.exit(1);
  } finally {
    try { await browser.close(); } catch(e) {}
  }
})();
