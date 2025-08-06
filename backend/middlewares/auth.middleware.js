const jwt = require('jsonwebtoken');
module.exports = verifyToken;

const SECRET = process.env.JWT_SECRET || 'votre_clef_secrete';

// Middleware pour vérifier token JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: "Token manquant" });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Token manquant" });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token invalide" });
    req.user = decoded;
    next();
  });
}