// Setup único do banco (Supabase/Postgres).
// Cria a tabela de conteúdo e faz o seed com o data.json atual.
//
// Uso:  node --env-file=.env scripts/setup-db.js

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const connectionString = process.env.POSTGRES_URL_NON_POOLING;
if (!connectionString) {
    console.error('Faltando POSTGRES_URL_NON_POOLING no ambiente (.env).');
    process.exit(1);
}

const seed = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'data.json'), 'utf8')
);

(async () => {
    // Remove sslmode da string (novas versões do pg o tratam como verify-full,
    // que falha no certificado do pooler). Controlamos o SSL via objeto.
    const client = new Client({
        connectionString: connectionString.split('?')[0],
        ssl: { rejectUnauthorized: false },
    });

    await client.connect();
    console.log('Conectado ao Postgres.');

    await client.query(`
        CREATE TABLE IF NOT EXISTS site_content (
            id          integer PRIMARY KEY,
            data        jsonb NOT NULL,
            updated_at  timestamptz NOT NULL DEFAULT now()
        );
    `);
    console.log('Tabela site_content pronta.');

    // Seed da linha id=1 só se ainda não existir (não sobrescreve edições).
    const r = await client.query(
        `INSERT INTO site_content (id, data)
         VALUES (1, $1)
         ON CONFLICT (id) DO NOTHING
         RETURNING id;`,
        [seed]
    );
    console.log(r.rowCount ? 'Conteúdo inicial inserido (id=1).' : 'Linha id=1 já existia — mantida.');

    await client.end();
    console.log('Concluído.');
})().catch((err) => {
    console.error('Erro no setup:', err.message);
    process.exit(1);
});
