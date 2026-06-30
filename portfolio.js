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

    // Dynamic Data Loading
    loadAndRenderPortfolio();
});

let allPortfolioItems = [];
let activeCategory = 'all';

function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

async function loadAndRenderPortfolio() {
    try {
        let data;
        try {
            const response = await fetch('/api/data'); 
            if (response.ok) {
                data = await response.json();
            } else {
                throw new Error('Fallback to local file');
            }
        } catch (e) {
            const resFile = await fetch('/data.json');
            data = await resFile.json();
        }

        if (!data) return;

        // Contact / WhatsApp
        if (data.contact) {
            window.whatsappNumber = data.contact.whatsappNumber;
            const floatWa = document.getElementById('floating-whatsapp');
            if (floatWa) {
                floatWa.href = `https://wa.me/${data.contact.whatsappNumber}`;
            }
        }

        // Portfolio Projects
        if (data.portfolio) {
            const pTitle = document.querySelector('.portfolio-main .blog-hero h1');
            if (data.portfolio.title && pTitle) {
                pTitle.innerHTML = data.portfolio.title;
            }
            const pDesc = document.querySelector('.portfolio-main .blog-hero p');
            if (data.portfolio.description && pDesc) {
                pDesc.textContent = data.portfolio.description;
            }

            allPortfolioItems = data.portfolio.items || [];
            window.portfolioItems = allPortfolioItems;
            
            // Set up category filters
            const grid = document.getElementById('portfolio-grid');
            const empty = document.getElementById('portfolio-empty');
            const filterBtns = document.querySelectorAll('#portfolio-filters .filter-btn');
            
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    activeCategory = btn.getAttribute('data-category');
                    applyPortfolioFilters(grid, empty);
                });
            });

            applyPortfolioFilters(grid, empty);
        }

        // Testimonials
        if (data.testimonials) {
            const tTitle = document.getElementById('testimonials-title');
            if (tTitle && data.testimonials.title) {
                tTitle.innerHTML = data.testimonials.title;
            }
            const tDesc = document.getElementById('testimonials-description');
            if (tDesc && data.testimonials.description) {
                tDesc.textContent = data.testimonials.description;
            }

            const tGrid = document.getElementById('testimonials-grid');
            if (tGrid && data.testimonials.items) {
                tGrid.innerHTML = data.testimonials.items.map((t, idx) => {
                    const initial = t.name ? t.name.charAt(0) : 'U';
                    return `
                    <div class="testimonial-card">
                        <i data-lucide="quote" class="testimonial-quote-icon" size="48"></i>
                        <p>"${escapeHtml(t.content)}"</p>
                        <div class="testimonial-author">
                            <div class="testimonial-avatar">${escapeHtml(initial)}</div>
                            <div class="testimonial-meta">
                                <h4>${escapeHtml(t.name)}</h4>
                                <span>${escapeHtml(t.role)}</span>
                            </div>
                        </div>
                    </div>
                `}).join('');
            }
        }

        // Re-initialize icons
        lucide.createIcons();
    } catch (err) {
        console.error('Error loading portfolio data:', err);
    }
}

function applyPortfolioFilters(grid, empty) {
    if (!grid) return;
    
    let filtered = allPortfolioItems;
    if (activeCategory !== 'all') {
        filtered = filtered.filter(p => {
            const cat = (p.category || '').toLowerCase().trim();
            const act = activeCategory.toLowerCase().trim();
            return cat === act;
        });
    }

    if (filtered.length === 0) {
        grid.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }

    if (empty) empty.style.display = 'none';

    grid.innerHTML = filtered.map((p, idx) => `
        <div class="portfolio-card" onclick="openProjectModal(allPortfolioItems.indexOf(p))" style="cursor:pointer;">
            <div class="portfolio-img-wrap">
                <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" loading="lazy">
            </div>
            <div class="portfolio-body">
                <span class="portfolio-tag">${escapeHtml(p.category)}</span>
                <h3>${escapeHtml(p.title)}</h3>
                <p>${escapeHtml(p.description)}</p>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

window.openProjectModal = function(idx) {
    const items = window.portfolioItems;
    if (!items || !items[idx]) return;
    
    const p = items[idx];
    const modal = document.getElementById('project-modal');
    const body = document.getElementById('project-modal-body');
    
    if (modal && body) {
        body.innerHTML = `
            <div class="modal-project-header">
                <span class="modal-project-tag">${escapeHtml(p.category)}</span>
                <h2>${escapeHtml(p.title)}</h2>
            </div>
            <div class="modal-project-img">
                <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}">
            </div>
            <div class="modal-project-description">
                <p>${escapeHtml(p.description)}</p>
            </div>
            <div class="modal-project-grid">
                <div class="modal-grid-card">
                    <h4><i data-lucide="help-circle"></i> O Desafio</h4>
                    <p>${escapeHtml(p.challenge || 'Desenvolver um projeto inovador e de alto impacto que atendesse aos objetivos da marca no mercado.')}</p>
                </div>
                <div class="modal-grid-card">
                    <h4><i data-lucide="check-square"></i> A Solução</h4>
                    <p>${escapeHtml(p.solution || 'Aplicação de metodologias ágeis de criação, design centrado no usuário e estratégias de marketing personalizadas.')}</p>
                </div>
                <div class="modal-grid-card">
                    <h4><i data-lucide="trending-up"></i> O Resultado</h4>
                    <p>${escapeHtml(p.results || 'Alinhamento completo com o público-alvo, aumento de engajamento e melhoria significativa na percepção de valor.')}</p>
                </div>
            </div>
            <div style="text-align: center; margin-top: 2rem;">
                <a href="https://wa.me/${window.whatsappNumber || '5585992629819'}?text=Ol%C3%A1%2C%20gostaria%20de%20um%20projeto%20semelhante%20ao%3A%20${encodeURIComponent(p.title)}" target="_blank" class="btn btn-primary" style="display:inline-flex; align-items:center; gap:0.5rem; justify-content:center;">
                    <i data-lucide="message-circle"></i> Quero um Projeto Semelhante
                </a>
            </div>
        `;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        lucide.createIcons();
    }
};

window.closeProjectModal = function() {
    const modal = document.getElementById('project-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
};
