// Setup do blog: cria a tabela `posts` e o bucket de imagens `blog`.
//
// Uso:  node --env-file=.env scripts/setup-blog.js

const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const pgUrl = process.env.POSTGRES_URL_NON_POOLING;
const supaUrl = process.env.SUPABASE_URL;
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!pgUrl || !supaUrl || !supaKey) {
    console.error('Faltam variáveis no .env (POSTGRES_URL_NON_POOLING, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).');
    process.exit(1);
}

(async () => {
    // 1) Tabela posts
    const pg = new Client({ connectionString: pgUrl.split('?')[0], ssl: { rejectUnauthorized: false } });
    await pg.connect();
    console.log('Conectado ao Postgres.');

    await pg.query(`
        CREATE TABLE IF NOT EXISTS posts (
            id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            slug         text UNIQUE NOT NULL,
            title        text NOT NULL,
            excerpt      text NOT NULL DEFAULT '',
            cover_url    text NOT NULL DEFAULT '',
            content      text NOT NULL DEFAULT '',
            status       text NOT NULL DEFAULT 'draft',
            published_at timestamptz,
            created_at   timestamptz NOT NULL DEFAULT now(),
            updated_at   timestamptz NOT NULL DEFAULT now()
        );
    `);
    await pg.query(`CREATE INDEX IF NOT EXISTS posts_status_pub_idx ON posts (status, published_at DESC);`);
    console.log('Tabela posts pronta.');
    await pg.end();

    // 2) Bucket público de imagens
    const supa = createClient(supaUrl, supaKey, { auth: { persistSession: false } });
    const { error } = await supa.storage.createBucket('blog', {
        public: true,
        fileSizeLimit: '6MB',
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    });
    if (error && !/already exists/i.test(error.message)) {
        throw error;
    }
    console.log(error ? 'Bucket "blog" já existia — mantido.' : 'Bucket "blog" criado (público).');

    console.log('Setup do blog concluído.');
})().catch((err) => {
    console.error('Erro no setup do blog:', err.message);
    process.exit(1);
});
