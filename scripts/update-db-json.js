// Script para atualizar o site_content no banco de dados com o data.json local.
// Uso:  node --env-file=.env scripts/update-db-json.js

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
    const client = new Client({
        connectionString: connectionString.split('?')[0],
        ssl: { rejectUnauthorized: false },
    });

    await client.connect();
    console.log('Conectado ao Postgres.');

    console.log('Atualizando site_content (id=1)...');
    const r = await client.query(
        `UPDATE site_content SET data = $1, updated_at = now() WHERE id = 1;`,
        [seed]
    );
    console.log(`Sucesso: ${r.rowCount} linha(s) atualizada(s).`);

    await client.end();
    console.log('Concluído.');
})().catch((err) => {
    console.error('Erro ao atualizar banco:', err.message);
    process.exit(1);
});
