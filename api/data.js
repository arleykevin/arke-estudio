// Função serverless da Vercel: lê e grava o conteúdo do site no Supabase.
//
// GET  -> retorna o conteúdo (com fallback para o data.json se o banco falhar).
// POST -> grava o conteúdo (exige header x-admin-password === ADMIN_PASSWORD).
//
// Variáveis de ambiente necessárias na Vercel:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_PASSWORD

const fallback = require('../data.json');
const { getContent, saveContent } = require('../lib/store');

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        res.setHeader('Cache-Control', 'no-store');
        try {
            const content = await getContent();
            return res.status(200).json(content || fallback);
        } catch (e) {
            // Não derruba o site se o banco estiver indisponível.
            return res.status(200).json(fallback);
        }
    }

    if (req.method === 'POST') {
        const provided = req.headers['x-admin-password'];
        if (!process.env.ADMIN_PASSWORD || provided !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ error: 'Não autorizado.' });
        }
        try {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            if (!body || typeof body !== 'object') {
                return res.status(400).json({ error: 'Conteúdo inválido.' });
            }
            await saveContent(body);
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(500).json({ error: 'Erro ao salvar.' });
        }
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método não permitido' });
};
