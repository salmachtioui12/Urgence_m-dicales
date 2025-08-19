const express = require("express");
const router = express.Router();
const Intervention = require("../models/Intervention");
const Ambulance = require("../models/Ambulance");
const Ambulancier = require("../models/Ambulancier");
const Appel = require("../models/Appel");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

// 📊 Statistiques et détails par hôpital
router.get("/hopital/:hopitalId", async (req, res) => {
  try {
    const hopitalId = req.params.hopitalId;

    // 1️⃣ Interventions groupées par gravité
    const interventionsParGravite = await Intervention.aggregate([
      { $match: { hopitalId: new ObjectId(hopitalId) } },
      { $group: { _id: "$gravite", total: { $sum: 1 } } }
    ]);

    // 2️⃣ Interventions par statut
    const interventionsParStatut = await Intervention.aggregate([
      { $match: { hopitalId: new ObjectId(hopitalId) } },
      { $group: { _id: "$statut", total: { $sum: 1 } } }
    ]);

    // 3️⃣ Durée moyenne des interventions
    const dureeMoyenne = await Intervention.aggregate([
      { $match: { hopitalId: new ObjectId(hopitalId), finIntervention: { $ne: null } } },
      { $project: { duree: { $subtract: ["$finIntervention", "$debutIntervention"] } } },
      { $group: { _id: null, moyenne: { $avg: "$duree" } } }
    ]);

    // 4️⃣ Statut des ambulances
    const ambulancesStatut = await Ambulance.aggregate([
      { $match: { hopitalId: new ObjectId(hopitalId) } },
      { $group: { _id: "$etat", total: { $sum: 1 } } }
    ]);

    // 5️⃣ Liste complète des ambulances avec détails
    const ambulances = await Ambulance.find({ hopitalId: new ObjectId(hopitalId) });

    // 6️⃣ Nombre et liste des ambulanciers avec détails
    const totalAmbulanciers = await Ambulancier.countDocuments({ hopitalId: new ObjectId(hopitalId) });
    const ambulanciers = await Ambulancier.find({ hopitalId: new ObjectId(hopitalId) });

    // 7️⃣ Tous les appels de cet hôpital avec détails
    const appels = await Appel.find({ hopitalId: new ObjectId(hopitalId) }).sort({ heureAppel: -1 });

    res.json({
      hopitalId,
      interventionsParGravite,
      interventionsParStatut,
      dureeMoyenne: dureeMoyenne[0]?.moyenne || 0,
      ambulancesStatut,
      totalAmbulanciers,
      ambulanciers,
      ambulances,
      appels
    });

  } catch (error) {
    console.error("Erreur stats hopital:", error);
    res.status(500).json({ error: "Erreur récupération statistiques" });
  }
});

module.exports = router;
