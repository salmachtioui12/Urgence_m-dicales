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

// ✅ Route spéciale pour les stats hebdomadaires
router.get("/users/weekly-registrations", async (req, res) => {
  try {
    const registrations = await User.aggregate([
      {
        $match: {
          createdAt: { 
            $gte: new Date(new Date().setDate(new Date().getDate() - 7)) 
          }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // 1=dimanche, 7=samedi
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Mapper les jours de la semaine
    const jours = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
    const formatted = registrations.map(r => ({
      day: jours[r._id - 1],
      count: r.count
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Erreur récupération weekly registrations:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// GET /users/hopitaux-ambulanciers - Récupérer nb ambulanciers par hôpital
router.get("/users/hopitaux-ambulanciers", verifyToken, async (req, res) => {
  try {
    const hopitaux = await Hopital.find().lean();

    // Pour chaque hôpital, compter ses ambulanciers
    const results = await Promise.all(
      hopitaux.map(async (hopital) => {
        const ambulanciersCount = await Ambulancier.countDocuments({ hopitalId: hopital._id });
        return {
          hopitalId: hopital._id,
          nom: hopital.nom,
          region: hopital.region,
          ambulanciersCount
        };
      })
    );

    res.json(results);
  } catch (err) {
    console.error("Erreur récupération hopitaux+ambulanciers:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// ⚠️ Placer APRÈS pour éviter le conflit
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
