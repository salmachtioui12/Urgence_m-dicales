const express = require('express');
const router = express.Router();
const Appel = require('../models/Appel'); 
const { getAllStats } = require('../services/stats.service');
const Hopital = require('../models/Hopital');
const Ambulance = require('../models/Ambulance');
const Intervention = require('../models/Intervention');
const verifyToken = require('../middlewares/auth.middleware'); // ✅ import correct
const { notifierStatistiques } = require('../websocket');
const {
  getAppels,
  updateAppelStatus,
  startAutoGeneration,
  stopAutoGeneration,
  genererAppel,
  prioriserEtAffecterAmbulances,
  getDerniersAppels,
} = require('../services/appels.service');

// Récupérer tous les appels
router.get('/', async (req, res) => {
  try {
    const appels = await Appel.find()
      .populate({
        path: 'ambulanceAffectee',
        model: 'Ambulance',
        populate: [
          { path: 'hopitalId', model: 'Hopital' } // info sur l'hôpital de l'ambulance
        ]
      })
      .lean(); // lean() pour retourner des objets JS simples

    // Pour chaque appel, récupérer les interventions et les ambulanciers associés
    const appelsAvecDetails = await Promise.all(
      appels.map(async (appel) => {
        const interventions = await Intervention.find({ appelId: appel._id })
          .populate('ambulanceId')
          .populate('ambulancierId')
          .populate('hopitalId')
          .lean();

        return {
          ...appel,
          interventions,
        };
      })
    );

    res.json(appelsAvecDetails);
  } catch (err) {
    console.error("Erreur récupération appels :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
 //Mettre à jour le statut
router.put('/:id/status', async (req, res) => {
  const appel = await updateAppelStatus(req.params.id, req.body.status);
  if (!appel) return res.status(404).json({ message: 'Appel non trouvé' });
  res.json({ message: 'Statut mis à jour', appel });
});

// Démarrer la génération auto
router.post('/start', (req, res) => {
  startAutoGeneration();
  res.json({ message: 'Génération démarrée' });
});

// Arrêter la génération auto
router.post('/stop', (req, res) => {
  stopAutoGeneration();
  res.json({ message: 'Génération arrêtée' });
});

// Ajouter un appel manuellement (optionnel)
router.post('/add', async (req, res) => {
  console.log(' Requête reçue sur /appels/add');
  const appel = await genererAppel();
  res.json(appel);
});

// Réinitialiser tous les appels + interventions liées
router.delete('/reset', async (req, res) => {
  const Appel = require('../models/Appel');
  const Intervention = require('../models/Intervention');

  try {
    // Récupérer tous les appels
    const appels = await Appel.find({});
    const appelIds = appels.map(appel => appel._id);

    // Supprimer toutes les interventions liées à ces appels
    await Intervention.deleteMany({ appelId: { $in: appelIds } });

    // Ensuite, supprimer les appels
    await Appel.deleteMany({ _id: { $in: appelIds } });
//  Notifier nouvelles stats après chaque appel généré
      const updatedStats = await getAllStats();
      notifierStatistiques(updatedStats);
    console.log(" Tous les appels et interventions supprimés.");
    res.json({ message: 'Appels et interventions réinitialisés' });
  } catch (err) {
    console.error("Erreur lors de la réinitialisation :", err);
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
});


// Générer plusieurs appels critiques (surcharge test)
router.post('/surcharge', async (req, res) => {
  const { genererAppel } = require('../services/appels.service');
  const appels = [];
  for (let i = 0; i < 10; i++) {
    appels.push(await genererAppel("critique"));
  }
  console.log(" 10 appels critiques générés.");
  res.json(appels);
});
router.post('/manual', async (req, res) => {
  try {
    const { description, patientName, localisation, gravite, lat, lng } = req.body;

    if (!patientName || !gravite || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    const appel = new Appel({
      description: description || `Appel manuel - ${gravite}`,
      patientName,
      localisation: localisation || 'Casablanca',
      gravite,
      heureAppel: new Date(),
      position: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      ambulanceAffectee: null,
      etat: 'en attente',
    });

    await appel.save();

    // Après sauvegarde, lancer l'affectation automatique
    await prioriserEtAffecterAmbulances();

    return res.status(201).json(appel);
  } catch (error) {
    console.error('Erreur création appel manuel:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la création d\'appel manuel' });
  }
});
//  Créer deux appels simulés en une seule requête
router.post('/double', async (req, res) => {
  try {
    // Générer UNE SEULE fois une date ISO complète
    const heureFixe = new Date().toISOString();

    // Créer deux appels avec exactement la même heure
    const appel1 = await genererAppel(null, heureFixe);
    const appel2 = await genererAppel(null, heureFixe);

    console.log(" Deux appels créés avec EXACTEMENT la même date :", heureFixe);
    res.status(201).json([appel1, appel2]);
  } catch (error) {
    console.error('Erreur lors de la création de deux appels :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de deux appels' });
  }
});

// Récupérer les 5 derniers appels
router.get('/recents', async (req, res) => {
  try {
    const derniersAppels = await getDerniersAppels();
    res.json(derniersAppels);
  } catch (err) {
    console.error("Erreur récupération derniers appels :", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
router.get('/hopital', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // ← à adapter selon ton système d'authentification

    // 1. Retrouver l'hôpital lié à ce compte utilisateur
    const hopital = await Hopital.findOne({ userId });
    if (!hopital) {
      return res.status(404).json({ message: 'Hôpital non trouvé pour cet utilisateur.' });
    }

    // 2. Récupérer les ambulances de cet hôpital
    const ambulances = await Ambulance.find({ hopitalId: hopital._id });
    const ambulanceIds = ambulances.map(a => a._id);

    if (ambulanceIds.length === 0) {
      return res.json([]); // Aucun appel s'il n'y a pas d'ambulance
    }

    // 3. Récupérer les appels affectés à ces ambulances
    const appels = await Appel.find({ ambulanceAffectee: { $in: ambulanceIds } })
                              .sort({ createdAt: -1 })
                              .limit(10); // limite à 10 derniers appels

    res.json(appels);
  } catch (error) {
    console.error("Erreur récupération appels par hôpital:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des appels." });
  }
});

module.exports = router;