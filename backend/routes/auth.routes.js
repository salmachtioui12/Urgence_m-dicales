const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

// Inscription
const Hopital = require('../models/Hopital'); // n'oublie pas de l'importer

router.post('/register', async (req, res) => {
  try {
    const { nom, email, password, role, details } = req.body;

    if (!nom || !email || !password || !role) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    // Validation selon rôle
  if (role === 'hopital') {
  const { adresse, position } = details || {};
  if (!adresse || !position || typeof position.lat !== 'number' || typeof position.lng !== 'number') {
    return res.status(400).json({ message: 'Adresse ou position lat/lng manquants ou invalides' });
  }
}


    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email déjà utilisé' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      nom,
      email,
      password: hashedPassword,
      role,
      details,
      status: role === 'ambulancier' ? 'en_attente' : 'approuve'
    });

    await user.save();

    // 🏥 Si le rôle est "hopital", crée l'entrée Hopital
    if (role === 'hopital') {
     const newHopital = new Hopital({
  nom,
  adresse: details.adresse || '',
  position: {
    lat: details.position.lat,
    lng: details.position.lng
  },
  region: details.region || '',
  contact: {
    telephoneUrgence: details.telephoneUrgence || '',
    telephoneSecondaire: details.telephoneSecondaire || '',
    email,
    siteWeb: details.siteWeb || ''
  },
  responsable: {
    nom: details.responsableNom || '',
    contact: details.responsableContact || ''
  },
  capacites: {
    lits: details.lits || 0,
    sallesOperation: details.sallesOperation || 0,
    ambulances: details.ambulances || 0,
    urgenceDisponible: details.urgenceDisponible || false,
    heuresOuverture: details.heuresOuverture || ''
  },
  medias: {
    logo: details.logo || '',
    imageCouverture: details.imageCouverture || ''
  },
  profilVerifie: false,
  userId: user._id,

});


      await newHopital.save();
    }

    res.status(201).json({
      message: role === 'ambulancier'
        ? "Demande envoyée à l'hôpital. Veuillez attendre la validation."
        : "Hôpital enregistré avec succès"
    });

  } catch (error) {
    console.error("Erreur inscription:", error);
    res.status(500).json({ message: 'Erreur serveur lors de l’inscription.' });
  }
});


// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    if (user.role === 'ambulancier' && user.status === 'en_attente') {
      return res.status(403).json({ message: "Votre compte est en attente de validation par un hôpital." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, nom: user.nom },
      SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        nom: user.nom,
        role: user.role,
        email: user.email,
        status: user.status,
        details: user.details,
      }
    });
  } catch (err) {
    console.error("Erreur login:", err);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
  }
});

// Récupérer ambulanciers en attente pour un hôpital donné (route protégée)
router.get('/demandes/ambulanciers/:hopitalNom', verifyToken, async (req, res) => {
  const { hopitalNom } = req.params;
 

  try {
    const ambulanciers = await User.find({
      role: 'ambulancier',
      status: 'en_attente',
      'details.hopitalNom': hopitalNom
    });

    
    res.json(ambulanciers);
  } catch (err) {
    console.error("Erreur récupération ambulanciers:", err);
    res.status(500).json({ message: 'Erreur lors de la récupération des ambulanciers.' });
  }
});


// Valider un ambulancier (protégé)
const Ambulancier = require('../models/Ambulancier'); // à importer tout en haut

router.patch('/valider/ambulancier/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user || user.role !== 'ambulancier') {
      return res.status(404).json({ message: "Ambulancier introuvable" });
    }

    // Mise à jour du statut
    user.status = 'approuve';
    await user.save();
 // Récupérer l'hôpital lié au user qui valide (depuis token)
    const hopital = await Hopital.findOne({ userId: req.user.id });
    if (!hopital) {
      return res.status(404).json({ message: "Hôpital valideur introuvable" });
    }
    // Créer un ambulancier à partir des détails
    const newAmbulancier = new Ambulancier({
      ...user.details, // attention : structure bien les détails
      email: user.email,
      userId: user._id,
        emailHopital: hopital.contact.email || hopital.userId.email || "",
    });

    await newAmbulancier.save();

    res.json({ message: 'Ambulancier validé et enregistré avec succès' });
  } catch (err) {
    console.error("Erreur validation ambulancier:", err);
    res.status(500).json({ message: 'Erreur lors de la validation.' });
  }
});


// Rejeter un ambulancier (protégé)
router.patch('/rejeter/ambulancier/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user || user.role !== 'ambulancier') {
      return res.status(404).json({ message: "Ambulancier introuvable" });
    }

    // Supprimer le user de la base
    await User.findByIdAndDelete(id);

    res.json({ message: 'Ambulancier rejeté et supprimé du système.' });
  } catch (err) {
    console.error("Erreur rejet ambulancier:", err);
    res.status(500).json({ message: 'Erreur lors du rejet.' });
  }
});


module.exports = router;
