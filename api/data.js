// Função serverless da Vercel para servir o conteúdo do site.
//
// A Vercel é serverless e tem o sistema de arquivos somente-leitura, então
// aqui só fazemos a LEITURA do data.json (incluído no bundle em build time).
// A gravação (salvar pelo admin) só funciona no servidor local (server.js),
// onde o disco é gravável. Para edição online seria necessário um storage
// externo (ex.: Vercel Blob / KV / Postgres).

const data = require('../data.json');

module.exports = (req, res) => {
    if (req.method === 'GET') {
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
        return res.status(200).json(data);
    }

    if (req.method === 'POST') {
        return res.status(501).json({
            error: 'Edição online indisponível neste ambiente (Vercel). ' +
                'Edite localmente com "npm start" ou configure um storage para habilitar.'
        });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método não permitido' });
};
