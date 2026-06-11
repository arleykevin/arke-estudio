// Upload de imagem (capa de post) para o Supabase Storage.
// POST /api/upload  body: { filename, dataUrl }  header: x-admin-password
// Retorna: { url }

const { getClient } = require('../lib/supabase');
const { isAuthed } = require('../lib/auth');

const MAX_BYTES = 4 * 1024 * 1024; // 4MB (abaixo do limite de body da Vercel)

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Método não permitido' });
    }
    if (!isAuthed(req)) return res.status(401).json({ error: 'Não autorizado.' });

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        const { filename, dataUrl } = body;
        if (!filename || !dataUrl) return res.status(400).json({ error: 'Arquivo inválido.' });

        const match = /^data:(.+?);base64,(.*)$/s.exec(dataUrl);
        if (!match) return res.status(400).json({ error: 'Formato de imagem inválido.' });

        const contentType = match[1];
        const buffer = Buffer.from(match[2], 'base64');
        if (buffer.length > MAX_BYTES) {
            return res.status(413).json({ error: 'Imagem muito grande (máx 4MB).' });
        }

        const ext = (String(filename).split('.').pop() || 'jpg')
            .toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
        const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const supa = getClient();
        const { error } = await supa.storage.from('blog').upload(path, buffer, {
            contentType,
            upsert: false,
        });
        if (error) throw error;

        const { data } = supa.storage.from('blog').getPublicUrl(path);
        return res.status(200).json({ url: data.publicUrl });
    } catch (e) {
        return res.status(500).json({ error: 'Erro ao enviar a imagem.' });
    }
};
