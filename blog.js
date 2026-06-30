document.addEventListener('DOMContentLoaded', () => {
    // Menu mobile
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            icon.setAttribute('data-lucide', navLinks.classList.contains('active') ? 'x' : 'menu');
            lucide.createIcons();
        });
    }

    // Navbar sempre com fundo nas páginas internas
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.classList.add('scrolled');

    const grid = document.getElementById('posts-grid');
    const article = document.getElementById('post');
    if (grid) renderList(grid);
    if (article) renderPost(article);

    // WhatsApp floating button dynamic link
    async function loadWhatsappNumber() {
        try {
            let data;
            try {
                const response = await fetch('/api/data');
                if (response.ok) data = await response.json();
            } catch (e) {
                const resFile = await fetch('/data.json');
                data = await resFile.json();
            }
            if (data && data.contact) {
                const floatWa = document.getElementById('floating-whatsapp');
                if (floatWa) {
                    floatWa.href = `https://wa.me/${data.contact.whatsappNumber}`;
                }
            }
        } catch (err) {
            console.log('Error loading WhatsApp number:', err);
        }
    }
    loadWhatsappNumber();
});

let allBlogPosts = [];
let activeCategory = 'all';
let searchQuery = '';

function fmtDate(iso) {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (e) {
        return '';
    }
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

async function renderList(grid) {
    const empty = document.getElementById('posts-empty');
    try {
        const res = await fetch('/api/posts');
        const posts = await res.json();
        if (!Array.isArray(posts) || posts.length === 0) {
            if (empty) empty.style.display = 'block';
            return;
        }
        
        allBlogPosts = posts;
        
        // Configurar busca e filtros
        const searchInput = document.getElementById('blog-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.toLowerCase().trim();
                applyBlogFilters(grid, empty);
            });
        }
        
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = btn.getAttribute('data-category');
                applyBlogFilters(grid, empty);
            });
        });

        applyBlogFilters(grid, empty);
    } catch (e) {
        if (empty) {
            empty.textContent = 'Não foi possível carregar os posts.';
            empty.style.display = 'block';
        }
    }
}

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function applyBlogFilters(grid, empty) {
    let filtered = allBlogPosts;
    
    // Filtro por categoria
    if (activeCategory !== 'all') {
        filtered = filtered.filter(p => {
            const cat = (p.category || 'Geral').toLowerCase().trim();
            const act = activeCategory.toLowerCase().trim();
            return cat === act;
        });
    }
    
    // Filtro por busca
    if (searchQuery) {
        const queryNorm = removeAccents(searchQuery);
        filtered = filtered.filter(p => {
            const title = removeAccents((p.title || '').toLowerCase());
            const excerpt = removeAccents((p.excerpt || '').toLowerCase());
            return title.includes(queryNorm) || excerpt.includes(queryNorm);
        });
    }
    
    if (filtered.length === 0) {
        grid.innerHTML = '';
        if (empty) {
            empty.textContent = 'Nenhum post encontrado para os filtros selecionados.';
            empty.style.display = 'block';
        }
        return;
    }
    
    if (empty) empty.style.display = 'none';
    
    let html = '';
    filtered.forEach((p, index) => {
        html += `
        <a class="post-card" href="/blog/${encodeURIComponent(p.slug)}">
            <div class="post-card-cover">
                ${p.cover_url
                    ? `<img src="${escapeHtml(p.cover_url)}" alt="${escapeHtml(p.title)}" loading="lazy">`
                    : `<div class="post-card-noimg"><i data-lucide="image"></i></div>`}
            </div>
            <div class="post-card-body">
                <div style="display: flex; gap: 0.55rem; align-items: center; margin-bottom: 0.6rem; flex-wrap: wrap;">
                    <span class="post-card-category">${escapeHtml(p.category || 'Geral')}</span>
                    <span class="post-card-date" style="margin: 0">${fmtDate(p.published_at)}</span>
                </div>
                <h3>${escapeHtml(p.title)}</h3>
                <p>${escapeHtml(p.excerpt || '')}</p>
                <span class="post-card-link">Ler mais <i data-lucide="arrow-right"></i></span>
            </div>
        </a>`;

        // Inserir card de anúncio AdSense após o 3º post (index 2)
        if (index === 2) {
            html += `
            <div class="post-card adsense-card" style="padding: 1.5rem; justify-content: center; align-items: center; min-height: 380px; background: rgba(255, 255, 255, 0.01);">
                <ins class="adsbygoogle"
                     style="display:block; width: 100%; height: 100%;"
                     data-ad-format="fluid"
                     data-ad-layout-key="-gw-3+1f-3d+2z"
                     data-ad-client="ca-pub-3118280438605658"
                     data-ad-slot="YOUR_IN_FEED_SLOT_ID_HERE"></ins>
            </div>`;
        }
    });
    
    grid.innerHTML = html;
    lucide.createIcons();

    // Inicializar anúncios dinâmicos no feed se houver posts suficientes
    if (filtered.length > 2) {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense In-Feed Error:", e);
        }
    }
}

function getSlug() {
    const u = new URL(location.href);
    const q = u.searchParams.get('slug');
    if (q) return q;
    const m = u.pathname.match(/\/blog\/([^\/]+)/);
    return m ? decodeURIComponent(m[1]) : null;
}

async function renderPost(el) {
    const slug = getSlug();
    if (!slug) return notFound(el);
    try {
        const res = await fetch('/api/posts?slug=' + encodeURIComponent(slug));
        if (!res.ok) return notFound(el);
        const p = await res.json();
        document.title = `${p.title} | ARKE Estúdio`;

        const rawHtml = marked.parse(p.content || '');
        const paragraphs = rawHtml.split('</p>');
        let finalHtml = rawHtml;
        let hasInArticleAd = false;
        
        if (paragraphs.length > 4) {
            hasInArticleAd = true;
            const adCode = `
            <div class="adsense-post-middle" style="margin: 2.5rem 0; text-align: center; min-height: 250px; background: rgba(255, 255, 255, 0.01); border-radius: 8px; overflow: hidden;">
                <ins class="adsbygoogle"
                     style="display:block; text-align:center;"
                     data-ad-layout="in-article"
                     data-ad-format="fluid"
                     data-ad-client="ca-pub-3118280438605658"
                     data-ad-slot="YOUR_POST_MIDDLE_SLOT_ID_HERE"></ins>
            </div>`;
            paragraphs.splice(3, 0, adCode);
            finalHtml = paragraphs.join('</p>');
        }

        el.innerHTML = `
            <a class="post-back" href="/blog"><i data-lucide="arrow-left"></i> Voltar ao blog</a>
            <span class="post-date">${fmtDate(p.published_at)}</span>
            <h1>${escapeHtml(p.title)}</h1>
            ${p.cover_url ? `<img class="post-cover" src="${escapeHtml(p.cover_url)}" alt="${escapeHtml(p.title)}">` : ''}
            
            <!-- Google AdSense - Topo do Post -->
            <div class="adsense-post-top" style="margin: 2rem 0; text-align: center; min-height: 90px; background: rgba(255, 255, 255, 0.01); border-radius: 8px; overflow: hidden;">
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-3118280438605658"
                     data-ad-slot="YOUR_POST_TOP_SLOT_ID_HERE"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
            </div>

            <div class="post-content">${finalHtml}</div>
            
            <!-- Google AdSense - Fim do Post -->
            <div class="adsense-post-bottom" style="margin: 3rem 0 2rem; padding-top: 2rem; border-top: 1px solid var(--border); text-align: center; min-height: 90px; background: rgba(255, 255, 255, 0.01); border-radius: 8px; overflow: hidden;">
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-3118280438605658"
                     data-ad-slot="YOUR_POST_BOTTOM_SLOT_ID_HERE"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
            </div>`;

        lucide.createIcons();

        // Inicializar anúncios do post de forma assíncrona
        try {
            // Inicializa anúncio do topo
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            
            // Inicializa anúncio do meio (se injetado)
            if (hasInArticleAd) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
            
            // Inicializa anúncio do fim
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense Post Units Error:", e);
        }
    } catch (e) {
        notFound(el);
    }
}

function notFound(el) {
    el.innerHTML = `
        <div class="post-notfound">
            <h1>Post não encontrado</h1>
            <p>O conteúdo que você procura não existe ou foi removido.</p>
            <a class="btn btn-primary" href="/blog">Ver todos os posts</a>
        </div>`;
    lucide.createIcons();
}
