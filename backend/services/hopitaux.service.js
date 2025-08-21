const Hopital = require('../models/Hopital');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
// Hack pour importer `node-fetch` en CommonJS (car node-fetch v3 utilise ESM uniquement)
// Cela permet d’appeler fetch comme dans un navigateur.
// Fonction pour récupérer les hôpitaux proches d’une position (lat, lng) via Overpass API
async function fetchHopitauxNearby(lat, lng, radius = 5000) {
    // Requête Overpass API en langage Overpass QL
  const query = `
    [out:json];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      way["amenity"="hospital"](around:${radius},${lat},${lng});
      relation["amenity"="hospital"](around:${radius},${lat},${lng});
    );
    out center;
  `;

  // Encodage de la requête pour l’URL
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  // Appel API Overpass avec fetch
  const response = await fetch(url);
  const data = await response.json();
 // Traitement des résultats
return await Promise.all(data.elements
   // On garde uniquement les éléments qui ont des coordonnées valides
  .filter(el => (el.lat || el.center?.lat) && (el.lon || el.center?.lon))
    // Construction de l’adresse si elle existe dans les tags OSM
  .map(async h => {
    const tags = h.tags || {};
    const adresse = [
      tags["addr:housenumber"],
      tags["addr:street"],
      tags["addr:postcode"],
      tags["addr:city"]
    ].filter(Boolean).join(', ');
  // Position (si c’est un node → lat/lon, si c’est un way/relation → center.lat/center.lon)
    const position = {
      lat: h.lat || h.center?.lat,
      lng: h.lon || h.center?.lon,
    };

    return {
      id: h.id,
      nom: tags.name || "Hôpital inconnu",
      adresse: adresse || null,
      position,
    };
  }));

}

module.exports = { fetchHopitauxNearby };