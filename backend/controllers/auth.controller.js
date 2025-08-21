// Import des modules nécessaires
const bcrypt = require('bcryptjs');   // Pour hacher et comparer les mots de passe
const jwt = require('jsonwebtoken');  // Pour générer et vérifier les tokens JWT
const User = require('../models/User'); // Le modèle User (schéma MongoDB)

// Clé secrète utilisée pour signer les tokens JWT (soit depuis .env, soit valeur par défaut)
const SECRET = process.env.JWT_SECRET || 'votre_clé_secrète_jwt';


exports.register = async (req, res) => {
  try {
    // Récupération des données envoyées dans la requête
    const { nom, email, password, role, details } = req.body;

    // Vérification des champs obligatoires
    if (!nom || !email || !password || !role) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    // Vérification si un utilisateur existe déjà avec cet email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    // Hashage du mot de passe avant de l'enregistrer en base
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création d'un nouvel utilisateur
    const user = new User({
      nom,
      email,
      password: hashedPassword, // mot de passe sécurisé
      role,
      details
    });

    // Sauvegarde en base
    await user.save();

    // Message de retour différent si c’est un ambulancier (car il doit être validé par un hôpital)
    const message = role === 'ambulancier'
      ? "Votre demande a été envoyée à l'hôpital pour approbation."
      : "Compte créé avec succès.";

    // Réponse au client
    res.status(201).json({ message });
  } catch (err) {
    // Gestion des erreurs serveur
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};


exports.login = async (req, res) => {
  try {
    // Récupération des identifiants envoyés
    const { email, password } = req.body;

    // Vérification des champs obligatoires
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    // Recherche de l'utilisateur dans la base
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // 🔐 Vérification spéciale pour les ambulanciers :
    // - Si le compte n'est pas encore approuvé, on bloque la connexion
    if (user.role === 'ambulancier' && user.status !== 'approuve') {
      return res.status(403).json({
        message: user.status === 'en_attente'
          ? "Votre compte est en attente d'approbation."
          : "Votre demande d'inscription a été rejetée."
      });
    }

    // Comparaison du mot de passe saisi avec celui enregistré (haché)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Mot de passe incorrect" });

    // Génération d'un token JWT qui contient l'id, le rôle et le nom de l'utilisateur
    const token = jwt.sign(
      { id: user._id, role: user.role, nom: user.nom },
      SECRET,               // clé secrète
      { expiresIn: '2h' }   // durée de validité du token
    );

    // Réponse envoyée au client (token à stocker côté front-end)
    res.json({ token });
  } catch (err) {
    // Gestion des erreurs serveur
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
