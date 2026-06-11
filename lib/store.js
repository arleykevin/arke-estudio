// Acesso ao conteúdo do site no Supabase.
// Compartilhado entre a função serverless (Vercel) e o servidor local.
// Usa a SERVICE ROLE key (somente no servidor — nunca exposta ao navegador).

const { getClient } = require('./supabase');

// Lê o conteúdo (linha id=1). Retorna null se não houver.
async function getContent() {
    const { data, error } = await getClient()
        .from('site_content')
        .select('data')
        .eq('id', 1)
        .maybeSingle();
    if (error) throw error;
    return data ? data.data : null;
}

// Grava/atualiza o conteúdo (upsert na linha id=1).
async function saveContent(content) {
    const { error } = await getClient()
        .from('site_content')
        .upsert(
            { id: 1, data: content, updated_at: new Date().toISOString() },
            { onConflict: 'id' }
        );
    if (error) throw error;
}

module.exports = { getContent, saveContent };
