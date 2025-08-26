// Import des composants nécessaires de React-Leaflet pour afficher la carte et les marqueurs
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// Import de la librairie Leaflet pour les icônes personnalisées
import L from "leaflet";
// Import du CSS par défaut de Leaflet
import "leaflet/dist/leaflet.css";

// Composant fonctionnel MapView qui affiche la carte avec les appels, agents et hôpitaux
const MapView = ({ appels, agents, hopitaux, changerStatut, icons, center, countAmbulancesByType, ambulanceTypeNames }) => {
  return (
    // Création du conteneur de la carte avec centre et niveau de zoom
    <MapContainer center={[center.lat, center.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
      {/* Couche de tuiles OpenStreetMap */}
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Marqueurs pour les appels d'urgence */}
      {appels.map((appel) => {
        // Choix de l'icône selon l'état de l'appel
        const icon = icons[appel.etat] || icons["en attente"];
        // Définition de la couleur selon la gravité
        const graviteColor =
          appel.gravite === "critique" ? "#e74c3c" : appel.gravite === "moyenne" ? "#e67e22" : "#27ae60";

        return (
          <Marker key={appel._id} position={[appel.position.lat, appel.position.lng]} icon={icon}>
            {/* Popup affiché au clic sur le marqueur */}
            <Popup>
              <div style={{ fontSize: "14px" }}>
                <strong>{appel.patientName}</strong><br />
                {appel.description}<br />
                <strong>📍</strong> {appel.localisation}<br />
                <strong>⏰</strong> {new Date(appel.heureAppel).toLocaleTimeString()}<br />
                <strong>🔥</strong> <span style={{ color: graviteColor }}>{appel.gravite}</span><br />
                <strong>🚑</strong> {appel.ambulanceAffectee || "Aucune"}<br />
                <strong>📡</strong> {appel.etat}<br />
                {/* Bouton pour changer l'état de l'appel */}
                <button onClick={() => changerStatut(appel._id, appel.etat)}>🔄 Changer état</button>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Marqueurs pour les agents (ambulanciers) */}
      {agents.map((a) => (
        <Marker key={a.id} position={[a.position.lat, a.position.lng]} icon={icons.agent}>
          <Popup>
            <strong>{a.nom}</strong><br />Position actuelle
          </Popup>
        </Marker>
      ))}

      {/* Marqueurs pour les hôpitaux */}
      {hopitaux.map((h) => (
        <Marker key={h.id || h._id} position={[h.position.lat, h.position.lng]} icon={icons.hopital}>
          <Popup>
            <strong>{h.nom}</strong><br />
            {h.adresse}<br />
            <strong>🚑</strong> {h.nombreAmbulances ?? "inconnu"}<br />
            {/* Liste détaillée du nombre d'ambulances par type */}
            {Array.isArray(h.ambulances) && (
              <ul style={{ marginTop: 4 }}>
                {Object.entries(countAmbulancesByType(h.ambulances)).map(([type, count]) => (
                  <li key={type}>
                    {count} × {ambulanceTypeNames[type] || `Type ${type}`}
                  </li>
                ))}
              </ul>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

// Export du composant MapView pour l'utiliser dans d'autres fichiers
export default MapView;
