const crypto = require('crypto');

// Comparação em tempo constante para evitar ataques de timing
function safeCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) {
        // Evita saída prematura executando uma operação falsa com buffers de mesmo tamanho
        crypto.timingSafeEqual(aBuf, aBuf);
        return false;
    }
    return crypto.timingSafeEqual(aBuf, bBuf);
}

// Verifica a senha de admin enviada no header x-admin-password.
function isAuthed(req) {
    const provided = req.headers['x-admin-password'];
    const expected = process.env.ADMIN_PASSWORD;
    return Boolean(expected) && safeCompare(provided, expected);
}

module.exports = { isAuthed };
