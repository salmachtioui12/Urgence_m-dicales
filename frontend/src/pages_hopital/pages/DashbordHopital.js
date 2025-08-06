import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default function DashboardHopital() {
  const [stats, setStats] = useState({
    demandesEnAttente: 0,
    ambulanciersApprouves: 0,
  });
  const [appels, setAppels] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Icônes pour les marqueurs
  const iconEnAttente = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const iconEnCours = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const iconTermine = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

useEffect(() => {
  if (!token || !user) return;

  axios
    .get("http://localhost:3000/api/ambulanciers/ambulanciers", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      setStats((prevStats) => ({
        ...prevStats,
        ambulanciersApprouves: res.data.length,
      }));
    })
    .catch((err) => {
      console.error("Erreur lors de la récupération des ambulanciers :", err);
      setError("Impossible de charger les ambulanciers.");
    });
}, [token, user]);

  useEffect(() => {
    if (!token || !user) return;

    // Charger les statistiques
    axios.get(`http://localhost:3000/api/auth/demandes/ambulanciers/${user.nom}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      setStats((s) => ({ ...s, demandesEnAttente: res.data.length }));
    })
    .catch(() => setError("Erreur lors du chargement des demandes"));

    // Charger les appels
    axios.get("http://localhost:3000/appels/hopital", {
      headers: { Authorization: `Bearer ${token}` },
      params: { emailHopital: user?.email },
    })
    .then((res) => {
      setAppels(res.data);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Erreur lors de la récupération des appels:", err);
      setError("Impossible de récupérer les appels");
      setLoading(false);
    });

  }, []);

  // Statistiques
  const appelsTermines = appels.filter(a => a.etat === "terminée").length;
  const appelsEnCours = appels.filter(a => a.etat === "en intervention").length;
  const appelsParGravite = {
    critique: appels.filter(a => a.gravite === "critique").length,
    moderee: appels.filter(a => a.gravite === "moyenne").length,
    faible: appels.filter(a => a.gravite === "faible").length
  };

  // Styles
  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  };

  const titleStyle = {
    fontSize: "1.8rem",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "1.5rem",
    textAlign: "center"
  };

  // Styles pour cartes compactes
  const cardContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem"
  };

  const cardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "1rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeft: "4px solid #3b82f6"
  };

  const cardTitleStyle = {
    fontSize: "0.85rem",
    color: "#64748b",
    fontWeight: "500",
    margin: "0"
  };

  const cardValueStyle = {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0"
  };

  const mapContainerStyle = {
    height: "500px",
    width: "100%",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    marginTop: "2rem",
    position: "relative"
  };

  const loadingStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    color: "#4a5568"
  };

  const errorStyle = {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1.5rem",
    textAlign: "center"
  };

  // Centre de la carte (Casablanca par défaut)
  const center = { lat: 33.5731, lng: -7.5898 };

  return (
    <div style={containerStyle}>
      {error && <div style={errorStyle}>{error}</div>}
      
      {/* Cartes compactes */}
      <div style={cardContainerStyle}>
        <div style={{ ...cardStyle, borderLeft: "4px solid #3b82f6" }}>
          <h3 style={cardTitleStyle}> les ambulanciers en attente</h3>
          <p style={cardValueStyle}>{stats.demandesEnAttente}</p>
        </div>

        <div style={{ ...cardStyle, borderLeft: "4px solid #10b981" }}>
          <h3 style={cardTitleStyle}>Nombre des Ambulanciers</h3>
          <p style={cardValueStyle}>{stats.ambulanciersApprouves}</p>
        </div>

        <div style={{ ...cardStyle, borderLeft: "4px solid #f59e0b" }}>
          <h3 style={cardTitleStyle}>En cours</h3>
          <p style={cardValueStyle}>{appelsEnCours}</p>
        </div>

        <div style={{ ...cardStyle, borderLeft: "4px solid #10b981" }}>
          <h3 style={cardTitleStyle}> les appels Terminés</h3>
          <p style={cardValueStyle}>{appelsTermines}</p>
        </div>

        <div style={{ ...cardStyle, borderLeft: "4px solid #ef4444" }}>
          <h3 style={cardTitleStyle}> les appels Critiques</h3>
          <p style={cardValueStyle}>{appelsParGravite.critique}</p>
        </div>

        <div style={{ ...cardStyle, borderLeft: "4px solid #f59e0b" }}>
          <h3 style={cardTitleStyle}> les appels Modérés</h3>
          <p style={cardValueStyle}>{appelsParGravite.moderee}</p>
        </div>

        <div style={{ ...cardStyle, borderLeft: "4px solid #10b981" }}>
          <h3 style={cardTitleStyle}>Faibles</h3>
          <p style={cardValueStyle}>{appelsParGravite.faible}</p>
        </div>
      </div>

      <h2 style={{ ...titleStyle, fontSize: "1.5rem", textAlign: "left", marginBottom: "1rem" }}>
        Carte des interventions
      </h2>
      
      <div style={mapContainerStyle}>
        {loading ? (
          <div style={loadingStyle}>Chargement de la carte...</div>
        ) : (
          <MapContainer 
            center={[center.lat, center.lng]} 
            zoom={13} 
            style={{ height: "100%", width: "100%", borderRadius: "10px" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {appels.map((appel) => {
              let icon;
              if (appel.etat === "en cours") icon = iconEnCours;
              else if (appel.etat === "terminé") icon = iconTermine;
              else icon = iconEnAttente;

              return (
                <Marker 
                  key={appel._id} 
                  position={[appel.position?.lat || center.lat, appel.position?.lng || center.lng]} 
                  icon={icon}
                >
                  <Popup>
                    <div style={{
                      fontFamily: "'Segoe UI', system-ui, sans-serif",
                      minWidth: "220px",
                      padding: "0",
                      borderRadius: "8px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        backgroundColor: "#3b82f6",
                        color: "white",
                        padding: "12px 16px",
                        fontWeight: "600",
                        fontSize: "16px"
                      }}>
                        {appel.patientName || "Patient inconnu"}
                      </div>
                      
                      <div style={{
                        padding: "12px 16px",
                        backgroundColor: "#f8fafc"
                      }}>
                        <div style={{
                          display: "flex",
                          alignItems: "flex-start",
                          marginBottom: "10px"
                        }}>
                          <div style={{
                            backgroundColor: "#e2e8f0",
                            borderRadius: "4px",
                            padding: "4px 6px",
                            marginRight: "10px",
                            minWidth: "24px",
                            textAlign: "center"
                          }}>
                            📍
                          </div>
                          <div>
                            <div style={{
                              fontSize: "12px",
                              color: "#64748b",
                              fontWeight: "500",
                              marginBottom: "2px"
                            }}>Localisation</div>
                            <div style={{ fontSize: "14px" }}>
                              {appel.localisation || "Non précisé"}
                            </div>
                          </div>
                        </div>
                        
                        <div style={{
                          display: "flex",
                          alignItems: "flex-start",
                          marginBottom: "10px"
                        }}>
                          <div style={{
                            backgroundColor: "#e2e8f0",
                            borderRadius: "4px",
                            padding: "4px 6px",
                            marginRight: "10px",
                            minWidth: "24px",
                            textAlign: "center"
                          }}>
                            ⚠️
                          </div>
                          <div>
                            <div style={{
                              fontSize: "12px",
                              color: "#64748b",
                              fontWeight: "500",
                              marginBottom: "2px"
                            }}>Gravité</div>
                            <div style={{ 
                              fontSize: "14px",
                              fontWeight: "600",
                              color: appel.gravite === "critique" ? "#ef4444" :
                                    appel.gravite === "modérée" ? "#f59e0b" : "#10b981"
                            }}>
                              {appel.gravite || "Non précisé"}
                            </div>
                          </div>
                        </div>
                        
                        <div style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          marginTop: "12px"
                        }}>
                          <span style={{
                            backgroundColor: appel.etat === "en cours" ? "#f59e0b" :
                                            appel.etat === "terminé" ? "#10b981" : "#94a3b8",
                            color: "white",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px"
                          }}>
                            {appel.etat || "Inconnu"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
}