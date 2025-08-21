// On importe jsonwebtoken pour vérifier et décoder les tokens JWT
const jwt = require('jsonwebtoken');

// On exporte la fonction verifyToken pour l'utiliser dans les routes
module.exports = verifyToken;

// Clé secrète utilisée pour signer et vérifier les tokens JWT
// On prend celle du fichier .env si elle existe, sinon on utilise une valeur par défaut
const SECRET = process.env.JWT_SECRET || 'votre_clef_secrete';

// ✅ Middleware pour vérifier le token JWT dans les requêtes
function verifyToken(req, res, next) {
  // On récupère l'en-tête Authorization envoyé par le client (ex: "Bearer <token>")
  const authHeader = req.headers['authorization'];

  // Si aucun header Authorization, on refuse l'accès
  if (!authHeader) return res.status(401).json({ message: "Token manquant" });

  // On extrait le token après "Bearer "
  const token = authHeader.split(' ')[1];

  // Si le token n’est pas présent, on refuse l'accès
  if (!token) return res.status(401).json({ message: "Token manquant" });

  // Vérification de la validité du token
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token invalide" });

    // Si le token est valide, on stocke les infos décodées dans req.user
    // Cela permet d'utiliser les données (id, role, etc.) dans les routes protégées
    req.user = decoded;

    // On passe au middleware suivant ou au contrôleur
    next();
  });
}
