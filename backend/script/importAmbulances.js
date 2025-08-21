const mongoose = require("mongoose");
const Hopital = require("../models/Hopital");
const Ambulance = require("../models/Ambulance");
//  Connexion à MongoDB (base locale "hopitaux")
mongoose.connect("mongodb://localhost:27017/hopitaux", {
  useNewUrlParser: true,// Options pour compatibilité
  useUnifiedTopology: true,// Nouvelle gestion du monitoring
});

async function importerAmbulances() {
  //  Récupérer tous les hôpitaux dans la base
  const hopitaux = await Hopital.find();

  //  Parcourir chaque hôpital
  for (const h of hopitaux) {
     // Vérifier que l’hôpital a bien une liste d’ambulances
    if (Array.isArray(h.ambulances)) {
           //  Parcourir chaque ambulance de l’hôpital
      for (const a of h.ambulances) {
        // Vérifier si cette ambulance existe déjà en BDD (évite doublons)
        const dejaExiste = await Ambulance.findOne({ id: a.id, hopitalId: h._id });
                // Si elle n’existe pas → on l’ajoute dans la collection Ambulance
        if (!dejaExiste) {
          await Ambulance.create({
            id: a.id,
            type: a.type,
            hopitalId: h._id,
            position: h.position,
            etat: "disponible",
          });
        }
      }
    }
  }

  console.log("Import terminé.");
  mongoose.disconnect();
}

importerAmbulances();
