// Servidor local (desenvolvimento). Serve os arquivos estáticos e a API,
// usando o mesmo Supabase que a Vercel — assim o admin local edita os
// mesmos dados de produção.
//
// Rode com:  npm start   (carrega o .env automaticamente se existir)

const express = require('express');
const cors = require('cors');
const { getContent, saveContent } = require('./lib/store');
const fallback = require('./data.json');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

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

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
