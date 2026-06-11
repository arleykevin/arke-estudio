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
});

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
        grid.innerHTML = posts.map((p) => `
            <a class="post-card" href="/blog/${encodeURIComponent(p.slug)}">
                <div class="post-card-cover">
                    ${p.cover_url
                        ? `<img src="${escapeHtml(p.cover_url)}" alt="${escapeHtml(p.title)}" loading="lazy">`
                        : `<div class="post-card-noimg"><i data-lucide="image"></i></div>`}
                </div>
                <div class="post-card-body">
                    <span class="post-card-date">${fmtDate(p.published_at)}</span>
                    <h3>${escapeHtml(p.title)}</h3>
                    <p>${escapeHtml(p.excerpt || '')}</p>
                    <span class="post-card-link">Ler mais <i data-lucide="arrow-right"></i></span>
                </div>
            </a>`).join('');
        lucide.createIcons();
    } catch (e) {
        if (empty) {
            empty.textContent = 'Não foi possível carregar os posts.';
            empty.style.display = 'block';
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
        el.innerHTML = `
            <a class="post-back" href="/blog"><i data-lucide="arrow-left"></i> Voltar ao blog</a>
            <span class="post-date">${fmtDate(p.published_at)}</span>
            <h1>${escapeHtml(p.title)}</h1>
            ${p.cover_url ? `<img class="post-cover" src="${escapeHtml(p.cover_url)}" alt="${escapeHtml(p.title)}">` : ''}
            <div class="post-content">${marked.parse(p.content || '')}</div>`;
        lucide.createIcons();
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
