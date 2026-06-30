// Servidor local (desenvolvimento). Serve os arquivos estáticos e a API,
// usando o mesmo Supabase que a Vercel — assim o admin local edita os
// mesmos dados de produção.
//
// Rode com:  npm start   (carrega o .env automaticamente se existir)

const express = require('express');
const cors = require('cors');
const path = require('path');
const { getContent, saveContent } = require('./lib/store');
const fallback = require('./data.json');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '6mb' }));
// Whitelist de arquivos estáticos públicos permitidos.
// Evita expor códigos de backend (server.js), variáveis (.env) e segredos.
const allowedStaticFiles = [
    '/styles.css',
    '/script.js',
    '/blog.js',
    '/portfolio.js',
    '/data.json',
    '/logo-arke.svg',
    '/logo.png',
    '/blusa.png',
    '/caneca.png',
    '/sacola.png',
    '/favicon.ico'
];

app.use((req, res, next) => {
    // Rota raiz serve a index
    if (req.path === '/' || req.path === '/index.html') {
        return res.sendFile(path.join(__dirname, 'index.html'));
    }
    // Rota do painel administrativo
    if (req.path === '/admin' || req.path === '/admin.html') {
        return res.sendFile(path.join(__dirname, 'admin.html'));
    }
    // Servir apenas se o arquivo solicitado estiver explicitamente na whitelist
    if (allowedStaticFiles.includes(req.path)) {
        return res.sendFile(path.join(__dirname, req.path));
    }
    next();
});

// Blog: reaproveita as mesmas funções serverless da Vercel.
app.all('/api/posts', require('./api/posts'));
app.all('/api/upload', require('./api/upload'));

app.get('/api/data', async (req, res) => {
    try {
        const content = await getContent();
        res.json(content || fallback);
    } catch (err) {
        console.error('Erro ao ler do Supabase:', err.message);
        res.json(fallback);
    }
});

app.post('/api/data', async (req, res) => {
    const provided = req.headers['x-admin-password'];
    if (!process.env.ADMIN_PASSWORD || provided !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Não autorizado.' });
    }
    try {
        await saveContent(req.body);
        res.json({ success: true });
    } catch (err) {
        console.error('Erro ao salvar no Supabase:', err.message);
        res.status(500).json({ error: 'Erro ao salvar os dados' });
    }
});

// URLs amigáveis do blog (espelham os rewrites do vercel.json).
app.get('/blog', (req, res) => res.sendFile(path.join(__dirname, 'blog.html')));
app.get('/blog/:slug', (req, res) => res.sendFile(path.join(__dirname, 'post.html')));
app.get('/portfolio', (req, res) => res.sendFile(path.join(__dirname, 'portfolio.html')));

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
