// Verifica a senha de admin enviada no header x-admin-password.
function isAuthed(req) {
    return Boolean(process.env.ADMIN_PASSWORD) &&
        req.headers['x-admin-password'] === process.env.ADMIN_PASSWORD;
}

module.exports = { isAuthed };
