// Acesso aos posts do blog no Supabase.
const { getClient } = require('./supabase');
const fallbackPosts = require('../posts_fallback.json');

const LIST_COLS = 'id, slug, title, excerpt, cover_url, category, published_at';
const ADMIN_LIST_COLS = 'id, slug, title, excerpt, cover_url, category, status, published_at, updated_at';

// Lista pública (apenas publicados, mais recentes primeiro).
async function listPublished() {
    try {
        const { data, error } = await getClient()
            .from('posts')
            .select(LIST_COLS)
            .eq('status', 'published')
            .order('published_at', { ascending: false });
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Erro ao ler posts do Supabase:', err.message);
        return fallbackPosts.filter(p => p.status === 'published');
    }
}

// Lista para o admin (todos, incluindo rascunhos).
async function listAll() {
    try {
        const { data, error } = await getClient()
            .from('posts')
            .select(ADMIN_LIST_COLS)
            .order('updated_at', { ascending: false });
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Erro ao listar todos os posts do Supabase:', err.message);
        return fallbackPosts;
    }
}

// Post único por slug. includeDrafts=true permite ver rascunhos (admin/preview).
async function getBySlug(slug, { includeDrafts = false } = {}) {
    try {
        let query = getClient().from('posts').select('*').eq('slug', slug);
        if (!includeDrafts) query = query.eq('status', 'published');
        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Erro ao buscar post por slug do Supabase:', err.message);
        const post = fallbackPosts.find(p => p.slug === slug);
        if (post && (includeDrafts || post.status === 'published')) {
            return post;
        }
        return null;
    }
}

async function createPost(fields) {
    const { data, error } = await getClient()
        .from('posts')
        .insert(fields)
        .select()
        .single();
    if (error) throw error;
    return data;
}

async function updatePost(id, fields) {
    const { data, error } = await getClient()
        .from('posts')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

async function deletePost(id) {
    const { error } = await getClient().from('posts').delete().eq('id', id);
    if (error) throw error;
}

module.exports = { listPublished, listAll, getBySlug, createPost, updatePost, deletePost };
