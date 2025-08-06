const axios = require("axios");
const Appel = require("../models/Appel");
const Ambulance = require("../models/Ambulance");
const Intervention = require("../models/Intervention");
const AffectationAmbulancier = require("../models/AffectationAmbulancier");

const { notifierCasCritique } = require('../websocket'); // à adapter selon ton arborescence
const { getAllStats } = require('./stats.service');
const { notifierStatistiques } = require('../websocket');
const { notifierDerniersAppels } = require('../websocket');
let intervalId = null;
const { notifierAmbulancierIntervention } = require("../websocket");
function genererGravite() {
  const r = Math.random();
  if (r < 0.2) return "critique";
  if (r < 0.6) return "moyenne";
  return "faible";
}

function genererHeureAppel() {
  return new Date().toISOString();
}

function genererPosition() {
  return {
    lat: 33.5731 + (Math.random() - 0.5) * 0.09,
    lng: -7.5898 + (Math.random() - 0.5) * 0.09,
  };
}

async function getLocalisationFromCoords(lat, lng) {
  try {
    const { data } = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: { lat, lon: lng, format: "json" },
      headers: { "User-Agent": "emergency-simulation-app" },
    });

    const addr = data.address;
    return (
      addr.suburb ||
      addr.neighbourhood ||
      addr.city ||
      addr.town ||
      addr.village ||
      data.display_name ||
      "Localisation inconnue"
    );
  } catch (err) {
    console.error(" Erreur Nominatim:", err.message);
    return "Localisation inconnue";
  }
}

function genererNomPatient(heureAppel) {
  const timestamp = new Date(heureAppel).getTime();
  const random = Math.floor(Math.random() * 900 + 100);
  return `Patient-${timestamp}-${random}`;
}

function distance(pos1, pos2) {
  const dx = pos1.lat - pos2.lat;
  const dy = pos1.lng - pos2.lng;
  return Math.sqrt(dx * dx + dy * dy);
}

// genererAppel
async function genererAppel(forceGravite = null) {
  try {
    const gravite = forceGravite || genererGravite();
    const position = genererPosition();
    const heureAppel = genererHeureAppel();
    const localisation = await getLocalisationFromCoords(position.lat, position.lng) || "Casablanca";
    const patientName = genererNomPatient(heureAppel);

    const appel = await Appel.create({
      description: `Appel simulé - ${gravite}`,
      patientName,
      localisation,
      heureAppel,
      gravite,
      ambulanceAffectee: null,
      etat: "en attente",
      position,
    });

 console.log(` Appel sauvegardé : ${appel.description}`);

    // Essayer d’affecter automatiquement
    await prioriserEtAffecterAmbulances();

    //  Recharger l’appel depuis la base après affectation
    const appelMisAJour = await Appel.findById(appel._id);

    //  Seulement s’il est encore critique sans ambulance, on notifie
    if (appelMisAJour.gravite === 'critique' && !appelMisAJour.ambulanceAffectee) {
      console.log(' ALERTE CRITIQUE détectée sans ambulance affectée pour :', appelMisAJour.patientName);
      notifierCasCritique(appelMisAJour);
       //  Notifier nouvelles stats après chaque appel généré
      const updatedStats = await getAllStats();
      notifierStatistiques(updatedStats);
      // après avoir sauvegardé un nouvel appel :
const appelsRecents = await getDerniersAppels();
notifierDerniersAppels(appelsRecents);
    }

    return appelMisAJour;

    
  } catch (err) {
    console.error(" Erreur génération appel :", err.message);
    return null;
  }
}
function typeAmbulanceAutorise(gravite) {
  if (gravite === 'critique') return ['C'];
  if (gravite === 'moyenne') return ['B', 'C'];
  return ['A', 'B', 'C'];
}
// AFFECTATION AUTOMATIQUE 
async function prioriserEtAffecterAmbulances() {
  try {
    const appels = await Appel.find({ etat: "en attente" }).sort({ gravite: 1, heureAppel: 1 });

    for (const appel of appels) {
      const typesAutorises = typeAmbulanceAutorise(appel.gravite);

      const ambulancesDispo = await Ambulance.find({
        etat: "disponible",
        type: { $in: typesAutorises }
      });

      if (ambulancesDispo.length === 0) continue;

      const lockedAmb = ambulancesDispo.sort(
        (a, b) => distance(appel.position, a.position) - distance(appel.position, b.position)
      )[0];

      if (!lockedAmb) continue;

      //  Mettre à jour l’ambulance (en mission + destination)
      await Ambulance.findByIdAndUpdate(lockedAmb._id, {
        etat: "en mission",
        destination: appel.localisation,
      });

      //  Mettre à jour l’appel
      await Appel.findByIdAndUpdate(appel._id, {
        etat: "en intervention",
        ambulanceAffectee: lockedAmb._id,
      });
// Trouver l'ambulancier affecté à cette ambulance


const affectation = await AffectationAmbulancier.findOne({
  ambulanceId: lockedAmb._id,
  dateFin: null
});

let ambulancier = null;
if (affectation?.ambulancierId) {
  ambulancier = await require('../models/Ambulancier').findById(affectation.ambulancierId);
}

const hopitalId = lockedAmb.hopitalId || null;

const intervention = await Intervention.create({
  appelId: appel._id,
  ambulanceId: lockedAmb._id,
  ambulancierId: affectation?.ambulancierId || null,
  hopitalId: hopitalId,
  gravite: appel.gravite,
  localisation: appel.localisation,
  patientName: appel.patientName,
  debutIntervention: new Date(),
  finEstimee: new Date(Date.now() + 5 * 60000),
  statut: "en cours",
});

// Sécuriser l'accès à userId
if (ambulancier?.userId) {
  notifierAmbulancierIntervention(ambulancier.userId.toString(), {
    appel,
    intervention,
  });
}

      console.log(` Ambulance ${lockedAmb._id} (type ${lockedAmb.type}) affectée à l'appel ${appel._id}`);
        //  Notifier nouvelles stats après chaque appel généré
      const updatedStats = await getAllStats();
      notifierStatistiques(updatedStats);
    }
  } catch (err) {
    console.error(" Erreur affectation automatique:", err.message);
  }
}


async function getAppels() {
  return Appel.find().sort({ createdAt: -1 });
}

async function updateAppelStatus(id, newStatus) {
  const appel = await Appel.findById(id);
  if (!appel) return null;

  // Mettre à jour l’état de l’appel
  appel.etat = newStatus;
  await appel.save();

  // Si on termine l'appel
  if (newStatus === 'terminée' && appel.ambulanceAffectee) {
    // 1. Marquer l’intervention comme terminée
    await Intervention.findOneAndUpdate(
      { appelId: appel._id, statut: 'en cours' },
      {
        statut: 'terminée',
        finEstimee: new Date()
      }
    );

    // 2. Remettre l’ambulance en état "disponible"
    await Ambulance.findByIdAndUpdate(appel.ambulanceAffectee, {
      etat: 'disponible',
      destination: null
    });

    // 3. Relancer l’algorithme pour affecter à d’autres appels
    await prioriserEtAffecterAmbulances();
    const updatedStats = await getAllStats();
    notifierStatistiques(updatedStats);
  }

  return appel;
}



async function affecterAmbulance(idAppel, idAmbulance) {
  return Appel.findByIdAndUpdate(idAppel, {
    ambulanceAffectee: idAmbulance,
    etat: "en intervention",
  });
}

function startAutoGeneration() {
  if (!intervalId) {
    intervalId = setInterval(() => genererAppel(), 30000 + Math.random() * 30000);
    console.log(" Génération automatique d'appels démarrée");
  }
}

function stopAutoGeneration() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log(" Génération automatique arrêtée");
  }
}

// notification en cas d'appel critique non aff

function getAppels() {
  return Appel.find().lean().then(appels => {
    return appels.map(appel => ({
      ...appel,
      estCritiqueNonAffecte: appel.gravite === 'critique' && appel.ambulanceAffectee === null
    }));
  });
}

// Récupérer les 5 derniers appels triés par heureAppel
async function getDerniersAppels(limit = 5) {
  return await Appel.find()
    .sort({ heureAppel: -1 }) // tri du plus récent au plus ancien
    .limit(limit);
}
module.exports = {
  genererAppel,
  getAppels,
  updateAppelStatus,
  affecterAmbulance,
  startAutoGeneration,
  stopAutoGeneration,
  prioriserEtAffecterAmbulances,
getDerniersAppels,
  
};
