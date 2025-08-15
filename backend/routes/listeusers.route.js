// routes/listeusers.route.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/auth.middleware");
const User = require("../models/User");
const Hopital = require("../models/Hopital");
const Ambulancier = require("../models/Ambulancier");

// GET /users/stats - Statistiques utilisateurs
router.get('/users/stats', verifyToken, async (req, res) => {
  try {
    const users = await User.find();

    const totalUsers = users.length;
    const totalHopitaux = users.filter(u => u.role === 'hopital').length;
    const totalAmbulanciers = users.filter(u => u.role === 'ambulancier').length;

    const statusCounts = {
      en_attente: users.filter(u => u.status === 'en_attente').length,
      approuve: users.filter(u => u.status === 'approuve').length,
      rejete: users.filter(u => u.status === 'rejete').length,
    };

    res.json({ totalUsers, totalHopitaux, totalAmbulanciers, statusCounts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /users - Récupérer tous les utilisateurs
router.get('/users', verifyToken, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /users/:id - Récupérer les détails selon le rôle
router.get('/users/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

    let details = null;
    if (user.role === 'hopital') {
      details = await Hopital.findOne({ userId: user._id });
    } else if (user.role === 'ambulancier') {
      details = await Ambulancier.findOne({ userId: user._id });
    }

    res.json({ user, details });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /users/:id - Supprimer un utilisateur
router.delete('/users/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

    // Supprimer les données associées selon le rôle
    if (user.role === 'hopital') {
      await Hopital.findOneAndDelete({ userId: user._id });
    } else if (user.role === 'ambulancier') {
      await Ambulancier.findOneAndDelete({ userId: user._id });
    }

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
