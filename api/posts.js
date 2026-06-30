// API do blog.
//   GET  /api/posts                -> lista publicados
//   GET  /api/posts?slug=meu-post  -> post único (rascunho só se autenticado)
//   GET  /api/posts?all=1          -> lista todos (admin)
//   POST /api/posts                -> cria/atualiza (admin)
//   DELETE /api/posts?id=...       -> remove (admin)

const {
    listPublished, listAll, getBySlug, createPost, updatePost, deletePost,
} = require('../lib/posts');
const { isAuthed } = require('../lib/auth');

function normalize(body) {
    const status = body.status === 'published' ? 'published' : 'draft';
    let published_at = body.published_at || null;
    if (status === 'published' && !published_at) {
        published_at = new Date().toISOString();
    }
    return {
        slug: String(body.slug || '').trim().toLowerCase(),
        title: String(body.title || '').trim(),
        excerpt: body.excerpt || '',
        cover_url: body.cover_url || '',
        content: body.content || '',
        category: String(body.category || 'Geral').trim(),
        status,
        published_at,
    };
}

module.exports = async (req, res) => {
    try {
        if (req.method === 'GET') {
            const { slug, all } = req.query || {};

            if (all) {
                if (!isAuthed(req)) return res.status(401).json({ error: 'Não autorizado.' });
                return res.status(200).json(await listAll());
            }

            if (slug) {
                const post = await getBySlug(slug, { includeDrafts: isAuthed(req) });
                if (!post) return res.status(404).json({ error: 'Post não encontrado.' });
                res.setHeader('Cache-Control', 'no-store');
                return res.status(200).json(post);
            }

            res.setHeader('Cache-Control', 'no-store');
            return res.status(200).json(await listPublished());
        }

        if (req.method === 'POST') {
            if (!isAuthed(req)) return res.status(401).json({ error: 'Não autorizado.' });
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
            const fields = normalize(body);
            if (!fields.title || !fields.slug) {
                return res.status(400).json({ error: 'Título e slug são obrigatórios.' });
            }
            const saved = body.id ? await updatePost(body.id, fields) : await createPost(fields);
            return res.status(200).json(saved);
        }

        if (req.method === 'DELETE') {
            if (!isAuthed(req)) return res.status(401).json({ error: 'Não autorizado.' });
            const id = (req.query && req.query.id) || (req.body && req.body.id);
            if (!id) return res.status(400).json({ error: 'id obrigatório.' });
            await deletePost(id);
            return res.status(200).json({ success: true });
        }

        res.setHeader('Allow', 'GET, POST, DELETE');
        return res.status(405).json({ error: 'Método não permitido' });
    } catch (e) {
        const dup = e && (e.code === '23505' || /duplicate key/i.test(e.message || ''));
        return res.status(dup ? 409 : 500).json({
            error: dup ? 'Já existe um post com esse slug.' : 'Erro no servidor.',
        });
    }
};
