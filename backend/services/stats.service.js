const {
  getTotalUrgencesTraitees,
  getTempsMoyenReponse,
  getTauxOccupation,
  getUrgencesParZone,
  getAmbulancesDisponibles,
  getRepartitionTypeUrgences,
  getAppelsParHeureDepuisDB,
} = require('../services/kpi.service');

async function getAllStats() {
  const [
    urgences,
    tempsReponse,
    occupation,
    urgencesZones,
    ambulances,
    repartitionUrgences,
    appelparheure,
  ] = await Promise.all([
    getTotalUrgencesTraitees(),
    getTempsMoyenReponse(),
    getTauxOccupation(),
    getUrgencesParZone(),
    getAmbulancesDisponibles(),
    getRepartitionTypeUrgences(),
    getAppelsParHeureDepuisDB(),
  ]);

  return {
    urgences,
    tempsReponse,
    occupation,
    urgencesZones,
    ambulances,
    repartitionUrgences,
    appelparheure,
  };
}

module.exports = { getAllStats };
