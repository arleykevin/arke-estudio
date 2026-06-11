// Acesso aos posts do blog no Supabase.
const { getClient } = require('./supabase');

const LIST_COLS = 'id, slug, title, excerpt, cover_url, published_at';
const ADMIN_LIST_COLS = 'id, slug, title, excerpt, cover_url, status, published_at, updated_at';

// Lista pública (apenas publicados, mais recentes primeiro).
async function listPublished() {
    const { data, error } = await getClient()
        .from('posts')
        .select(LIST_COLS)
        .eq('status', 'published')
        .order('published_at', { ascending: false });
    if (error) throw error;
    return data;
}

// Lista para o admin (todos, incluindo rascunhos).
async function listAll() {
    const { data, error } = await getClient()
        .from('posts')
        .select(ADMIN_LIST_COLS)
        .order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
}

// Post único por slug. includeDrafts=true permite ver rascunhos (admin/preview).
async function getBySlug(slug, { includeDrafts = false } = {}) {
    let query = getClient().from('posts').select('*').eq('slug', slug);
    if (!includeDrafts) query = query.eq('status', 'published');
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data;
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
