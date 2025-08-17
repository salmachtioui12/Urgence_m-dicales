const express = require('express');
const router = express.Router();

const {getAllStats}=require('../services/stats.service');
const {
  getTotalUrgencesTraitees,
  getTempsMoyenReponse,
  getTauxOccupation,
  getUrgencesParZone,
  getAmbulancesDisponibles,
  getRepartitionTypeUrgences,
  getAppelsParGravite,
 /* getInterventionsEnAttente,
  getAgentsEnService,*/
} = require('../services/kpi.service');

// Routes existantes
router.get('/total-urgences', async (req, res) => {
  try {
    const total = await getTotalUrgencesTraitees();
    res.json({ total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur total urgences' });
  }
});

router.get('/temps-moyen-reponse', async (req, res) => {
  try {
    const moyenne = await getTempsMoyenReponse();
    res.json({ moyenne });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur temps moyen' });
  }
});

router.get('/taux-occupation', async (req, res) => {
  try {
    const taux = await getTauxOccupation();
    res.json({ taux });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur taux occupation' });
  }
});

router.get('/urgences-par-zone', async (req, res) => {
  try {
    const data = await getUrgencesParZone();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur urgences par zone' });
  }
});


// Nombre total & disponibles ambulances
router.get('/ambulances-disponibles', async (req, res) => {
  try {
    const data = await getAmbulancesDisponibles();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur ambulances disponibles' });
  }
});

// Répartition des types d’urgences
router.get('/repartition-types-urgences', async (req, res) => {
  try {
    const data = await getRepartitionTypeUrgences();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur répartition types urgences' });
  }
});

// Nombre d’interventions en attente
router.get('/interventions-en-attente', async (req, res) => {
  try {
    const count = await getInterventionsEnAttente();
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur interventions en attente' });
  }
});

// Nombre d’agents en service
router.get('/agents-en-service', async (req, res) => {
  try {
    const count = await getAgentsEnService();
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur agents en service' });
  }
});




router.get('/appels-par-gravite', async (req, res) => {
  try {
    const { debut, fin } = req.query;
    const data = await getAppelsParGravite({ debut, fin });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur appels par gravité' });
  }
});
// Route pour la statistique globale
router.get('/statistique', async (req, res) => {
  try {
    const stats = await getAllStats();
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques :', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques.' });
  }
});
module.exports = router;
