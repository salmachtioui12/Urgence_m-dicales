const express = require("express");
const router = express.Router();
const Intervention = require("../models/Intervention");
const Ambulance = require("../models/Ambulance");
const Appel = require("../models/Appel");
const { updateAppelStatus } = require('../services/appels.service');
const { getAllStats } = require('../services/stats.service');
const { notifierStatistiques } = require('../websocket');

const {prioriserEtAffecterAmbulances } = require('../services/appels.service');
const verifyToken = require('../middlewares/auth.middleware');
const Ambulancier = require('../models/Ambulancier');

// GET /interventions/en-cours
router.get("/en-cours", async (req, res) => {
  try {
    const interventions = await Intervention.find({ statut: "en cours" })
      .populate("appelId")
      .populate("ambulanceId")
      .sort({ debutIntervention: -1 });

    res.json(interventions);
  } catch (err) {
    console.error(" Erreur récupération interventions :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// Marquer une intervention comme terminée
/*router.put('/:id/finish', async (req, res) => {
  try {
    const intervention = await Intervention.findById(req.params.id);
    if (!intervention) {
      return res.status(404).json({ message: "Intervention non trouvée" });
    }

    intervention.statut = 'terminée';
    intervention.finEstimee = new Date();
    await intervention.save();

    const appel = await updateAppelStatus(intervention.appelId, 'terminée');
 
      const updatedStats = await getAllStats();
      notifierStatistiques(updatedStats);
    return res.json({ message: "Intervention et appel terminés", appel });
  } catch (error) {
    console.error("Erreur lors de la fin d'intervention :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});*/
// PATCH pour terminer une intervention
/*router.patch("/:id/terminer", async (req, res) => {
  try {
    const intervention = await Intervention.findById(req.params.id);
    if (!intervention) return res.status(404).json({ message: "Introuvable" });

    intervention.finIntervention = new Date();
    intervention.statut = "terminée";
    await intervention.save();
// Mettre à jour l'état et statut de l'ambulance associée pour la rendre disponible
    if (intervention.ambulanceId) {
      await Ambulance.findByIdAndUpdate(intervention.ambulanceId, {
        etat: 'disponible',
        statut: 'disponible',
        destination: null,
      });
    }
       // Mettre à jour l'état de l'appel associé en "terminée"
    if (intervention.appelId) {
      await Appel.findByIdAndUpdate(intervention.appelId, {
        etat: "terminée",
      });
    }
    //  Notifier nouvelles stats après chaque appel généré
      const updatedStats = await getAllStats();
      notifierStatistiques(updatedStats);
    res.json({ message: "Intervention terminée", intervention });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});*/
/*router.patch("/:id/terminer", async (req, res) => {
  try {
    const intervention = await Intervention.findById(req.params.id);
    if (!intervention) return res.status(404).json({ message: "Introuvable" });

    intervention.finIntervention = new Date();
    intervention.statut = "terminée";
    await intervention.save();

    // Mettre à jour l'état et statut de l'ambulance associée pour la rendre disponible
    if (intervention.ambulanceId) {
      await Ambulance.findByIdAndUpdate(intervention.ambulanceId, {
        etat: 'disponible',
        statut: 'disponible',
        destination: null,
      });
    }

    // Mettre à jour l'état de l'appel associé en "terminée"
    if (intervention.appelId) {
      await Appel.findByIdAndUpdate(intervention.appelId, {
        etat: "terminée",
      });

      // Relancer l’algorithme d’affectation après la fin de l'appel
      await prioriserEtAffecterAmbulances();

      // Mettre à jour les stats et notifier
      const updatedStats = await getAllStats();
      notifierStatistiques(updatedStats);
    }

    res.json({ message: "Intervention terminée", intervention });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
*/
// GET interventions de l'ambulancier connecté
router.get('/mes-interventions', verifyToken, async (req, res) => {
  try {
    // L'utilisateur connecté est un ambulancier (via le token)
    const userId = req.user.id;

    // Trouver le document Ambulancier correspondant à ce userId
    const ambulancier = await Ambulancier.findOne({ userId });
    if (!ambulancier) {
      return res.status(404).json({ message: "Ambulancier non trouvé" });
    }

    // Trouver toutes les interventions liées à cet ambulancier
    const interventions = await Intervention.find({ ambulancierId: ambulancier._id })
      .populate('appelId')
      .populate('ambulanceId')
      .populate('hopitalId');

    res.json(interventions);
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
async function terminerIntervention(interventionId) {
  const intervention = await Intervention.findById(interventionId);
  if (!intervention) throw new Error("Intervention introuvable");

  intervention.finIntervention = new Date();
  intervention.statut = "terminée";
  await intervention.save();

  if (intervention.ambulanceId) {
    await Ambulance.findByIdAndUpdate(intervention.ambulanceId, {
      etat: 'disponible',
      statut: 'disponible',
      destination: null,
    });
  }

  if (intervention.appelId) {
    await Appel.findByIdAndUpdate(intervention.appelId, {
      etat: "terminée",
    });
  }

  await prioriserEtAffecterAmbulances();

  const updatedStats = await getAllStats();
  notifierStatistiques(updatedStats);

  return intervention;
}
router.patch("/:id/terminer", async (req, res) => {
  try {
    const intervention = await terminerIntervention(req.params.id);
    res.json({ message: "Intervention terminée", intervention });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.put("/:id/finish", async (req, res) => {
  try {
    const intervention = await terminerIntervention(req.params.id);
    res.json({ message: "Intervention et appel terminés", intervention });
  } catch (error) {
    console.error("Erreur lors de la fin d'intervention :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;

