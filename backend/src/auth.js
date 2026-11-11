// AI-assisted: see docs/AI_LOG.md #21
const { auth } = require('./firebase');

async function requireAuth(req, res, next) {
  const header = req.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Falta el token de sesión' });

  try {
    const decoded = await auth.verifyIdToken(token);
    req.uid = decoded.uid;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token de sesión inválido o vencido' });
  }
}

module.exports = { requireAuth };