const Appel = require('../models/Appel');
const Intervention = require('../models/Intervention');
const Ambulance = require('../models/Ambulance');

async function getTotalUrgencesTraitees() {
  const appelterminer= await Appel.countDocuments({ etat: 'terminée' }); 
   const appelenattend= await Appel.countDocuments({ etat: 'en attente' }); 
    const appeleninterv= await Appel.countDocuments({ etat: 'en intervention' }); 
  return {appelterminer,appelenattend,appeleninterv}; // Assure-toi que ce champ existe bien
}

async function getTempsMoyenReponse() {
  const interventions = await Intervention.find().select('heureDebut heureArrivee');
  const delais = interventions.map(i => {
    if (!i.heureDebut || !i.heureArrivee) return 0;
    return (new Date(i.heureArrivee) - new Date(i.heureDebut)) / 1000 / 60; // en minutes
  }).filter(t => t > 0);
  const moyenne = delais.length ? delais.reduce((a, b) => a + b, 0) / delais.length : 0;
  return moyenne.toFixed(2);
}

async function getTauxOccupation() {
  const total = await Ambulance.countDocuments();
  const occupees = await Ambulance.countDocuments({ etat: 'en mission' });
  return total === 0 ? 0 : ((occupees / total) * 100).toFixed(2);
}


async function getUrgencesParZone() {
  return await Appel.aggregate([
    {
      
      $group: {
        _id: '$localisation',
        total: { $sum: 1 }
      }
    }
  ]);
}
async function getAmbulancesDisponibles() {
  const total = await Ambulance.countDocuments();
  const disponibles = await Ambulance.countDocuments({ etat: 'disponible' });
  const missions = await Ambulance.countDocuments({ etat: 'en mission' });
  return { total, disponibles ,missions};
}

async function getRepartitionTypeUrgences() {
  return await Appel.aggregate([
    {
      $group: {
              _id: { $ifNull: ["$gravite", "Inconnu"] },  // adapte ce champ à ta base
        total: { $sum: 1 }
      }
    }
  ]);
}
/*
async function getInterventionsEnAttente() {
  return await Intervention.countDocuments({ etat: 'en attente' });
}

async function getAgentsEnService() {
  return await Agent.countDocuments({ enService: true });
}*/
// Appels par gravité avec filtre de date
async function getAppelsParGravite({ debut, fin }) {
  const filtre = {};

  if (debut && fin) {
    filtre.createdAt = {
      $gte: new Date(debut),
      $lte: new Date(fin)
    };
  }

  const result = await Appel.aggregate([
    { $match: filtre },
    {
      $group: {
        _id: '$gravite',
        total: { $sum: 1 }
      }
    }
  ]);

  return result;
}





const getStatistiques = async (req, res) => {
  try {
    const stats = await getAllStats();
    console.log("Résultat final des stats :", stats);
    res.status(200).json(stats);
  } catch (error) {
    console.error("Erreur dans getStatistiques :", error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques.' });
  }
};
// Fonction pour récupérer le nombre d'appels par minute depuis minuit aujourd'hui
async function getAppelsParHeureDepuisDB() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // début de la journée à 00:00:00

  const results = await Appel.aggregate([
    {
      $match: {
        heureAppel: { $gte: today }
      }
    },
    {
      $group: {
        _id: {
          hour: { $hour: "$heureAppel" },
          minute: { $minute: "$heureAppel" }
        },
        total: { $sum: 1 }
      }
    },
    {
      $sort: {
        "_id.hour": 1,
        "_id.minute": 1
      }
    }
  ]);

  // Exemple de format de résultat : [{ time: "08:32", total: 4 }, ...]
  return results.map(item => ({
    time: `${item._id.hour.toString().padStart(2, '0')}:${item._id.minute.toString().padStart(2, '0')}`,
    total: item.total,
  }));
}

module.exports = {
  getTotalUrgencesTraitees,
  getTempsMoyenReponse,
  getTauxOccupation,
  getUrgencesParZone,
  /*getAgentsEnService,
  getInterventionsEnAttente,*/
  getRepartitionTypeUrgences,
  getAmbulancesDisponibles,
  getAppelsParGravite,
  getStatistiques,
  getAppelsParHeureDepuisDB,
};
