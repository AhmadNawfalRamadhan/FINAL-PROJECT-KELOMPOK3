function requireAdmin(req, res, next) {
  if (!req.session?.adminId) return res.status(401).json({ message: 'Login admin diperlukan.' });
  next();
}
module.exports = { requireAdmin };
