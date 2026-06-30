// Script para adicionar coluna de categoria na tabela posts do Supabase.
// Uso:  node --env-file=.env scripts/add-category-column.js

const { Client } = require('pg');

const connectionString = process.env.POSTGRES_URL_NON_POOLING;
if (!connectionString) {
    console.error('Faltando POSTGRES_URL_NON_POOLING no ambiente (.env).');
    process.exit(1);
}

(async () => {
    const client = new Client({
        connectionString: connectionString.split('?')[0],
        ssl: { rejectUnauthorized: false },
    });

    await client.connect();
    console.log('Conectado ao Postgres.');

    console.log('Adicionando coluna category na tabela posts se não existir...');
    await client.query(`
        ALTER TABLE posts 
        ADD COLUMN IF NOT EXISTS category text DEFAULT 'Geral';
    `);
    console.log('Coluna category adicionada ou já existente.');

    await client.end();
    console.log('Concluído.');
})().catch((err) => {
    console.error('Erro ao adicionar coluna:', err.message);
    process.exit(1);
});
