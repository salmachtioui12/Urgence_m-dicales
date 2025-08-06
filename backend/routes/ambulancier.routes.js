const express = require('express');
const router = express.Router();

const Ambulancier = require('../models/Ambulancier');
const Hopital = require('../models/Hopital');
const verifyToken = require('../middlewares/auth.middleware'); // ✅ import correct
const User = require('../models/User'); // adapte le chemin si besoin

// 📌 GET profil ambulancier via email (non protégé)
router.get('/profil/:email', async (req, res) => {
  const email = req.params.email;

  try {
    const profil = await Ambulancier.findOne({ email });

    if (!profil) {
      return res.status(404).json({ message: "Profil ambulancier introuvable" });
    }

    res.json(profil);
  } catch (err) {
    console.error("Erreur récupération profil ambulancier:", err);
    res.status(500).json({ message: "Erreur serveur lors de la récupération du profil." });
  }
});

// PATCH : mise à jour du profil ambulancier
router.patch('/profil/:email', async (req, res) => {
  const email = req.params.email;
  const updates = req.body;

  try {
    const updated = await Ambulancier.findOneAndUpdate(
      { email },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Profil non trouvé pour mise à jour" });
    }

    res.json({ message: "Profil mis à jour", data: updated });
  } catch (err) {
    console.error("Erreur update ambulancier:", err);
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
});
router.get("/ambulanciers", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ message: "User non authentifié" });

    // Trouver l’hôpital connecté
    const hopital = await Hopital.findOne({ userId });
    if (!hopital) return res.status(404).json({ message: "Hôpital introuvable." });

    const emailHopital = hopital.contact?.email;
    if (!emailHopital) {
      return res.status(400).json({ message: "L'email de l'hôpital est manquant dans le champ contact." });
    }

   

    // Récupérer les ambulanciers liés à cet hôpital
    const ambulanciers = await Ambulancier.find({ emailHopital });

    res.status(200).json(ambulanciers);
  } catch (err) {
    console.error("Erreur lors de la récupération des ambulanciers:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});
// 🔥 Supprimer un ambulancier + son compte utilisateur
const mongoose = require('mongoose');

router.delete('/ambulancier/:id', verifyToken, async (req, res) => {
  try {
    const ambulancierIdRaw = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(ambulancierIdRaw)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const ambulancierId = new mongoose.Types.ObjectId(ambulancierIdRaw);

    console.log(`🔍 Suppression demandée pour l'ambulancier ID: ${ambulancierIdRaw}`);

    const ambulancier = await Ambulancier.findById(ambulancierId);
    console.log("🔎 Ambulancier récupéré :", ambulancier);

    if (!ambulancier) {
      console.log("❌ Ambulancier non trouvé.");
      return res.status(404).json({ message: "Ambulancier non trouvé." });
    }

    const userId = ambulancier.userId;
    console.log("👤 ID du compte utilisateur lié :", userId);

    await Ambulancier.findByIdAndDelete(ambulancierId);
    console.log("🗑️ Ambulancier supprimé");

    if (userId) {
      await User.findByIdAndDelete(userId);
      console.log("🗑️ Compte utilisateur supprimé");
    }

    res.status(200).json({ message: "✅ Ambulancier et son compte utilisateur supprimés." });
  } catch (error) {
    console.error("💥 Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression.", error });
  }
});


module.exports = router;
