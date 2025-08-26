import React, { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
const WS_URL = "ws://localhost:3000";


export default function DashboardAmbulancier() {
  const [interventions, setInterventions] = useState([]);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
const navigate = useNavigate();

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const backoffRef = useRef(500);
const handleUnauthorized = () => {
  localStorage.removeItem('token'); // On supprime le token
  navigate('/login');              // Redirection vers la page login
};

  // Styles
  const styles = {
    container: {
      maxWidth: "1000px",
      margin: "0 auto",
      padding: "20px",
      fontFamily: "'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
    },
    header: {
      marginBottom: "30px",
      textAlign: "center",
    },
    title: {
      color: "#2c3e50",
      fontSize: "28px",
      fontWeight: "500",
      marginBottom: "10px",
      borderBottom: "1px solid #eee",
      paddingBottom: "10px",
    },
    status: {
      color: connected ? "#2ecc71" : "#e74c3c",
      fontWeight: "500",
    },
    loading: {
      textAlign: "center",
      color: "#666",
      marginTop: "50px",
    },
    errorMessage: {
      textAlign: "center",
      color: "#d32f2f",
      marginTop: "50px",
      padding: "15px",
      backgroundColor: "#fde0e0",
      borderRadius: "4px",
    },
    noInterventions: {
      textAlign: "center",
      color: "#666",
      marginTop: "30px",
    },
    interventionsList: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    interventionCard: {
      border: "1px solid #e0e0e0",
      borderRadius: "6px",
      overflow: "hidden",
      backgroundColor: "white",
      transition: "box-shadow 0.3s ease",
      ":hover": {
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      },
    },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 20px",
      backgroundColor: "#f5f5f5",
      borderBottom: "1px solid #e0e0e0",
    },
    patientName: {
      margin: "0",
      fontSize: "16px",
      fontWeight: "500",
      color: "#333",
    },
    gravityBadge: {
      padding: "4px 10px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "500",
      textTransform: "capitalize",
    },
    gravityFaible: {
      backgroundColor: "#fff3e0",
      color: "#e65100",
    },
    gravityMoyenne: {
      backgroundColor: "#fff8e1",
      color: "#ff8f00",
    },
    gravityCritique: {
      backgroundColor: "#ffebee",
      color: "#c62828",
    },
    cardContent: {
      padding: "20px",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: "15px",
    },
    infoGroup: {
      marginBottom: "5px",
    },
    infoLabel: {
      display: "block",
      fontSize: "13px",
      color: "#666",
      marginBottom: "3px",
    },
    infoValue: {
      margin: "0",
      fontSize: "14px",
      color: "#333",
    },
    statusText: {
      fontWeight: "500",
    },
    statusEnCours: {
      color: "#1976d2",
    },
    statusTerminee: {
      color: "#388e3c",
    },
    buttonGroup: {
      display: "flex",
      gap: "10px",
      marginTop: "15px",
      padding: "0 20px 20px",
    },
    button: {
      flex: 1,
      padding: "8px 12px",
      borderRadius: "5px",
      border: "none",
      cursor: "pointer",
      fontWeight: "500",
      transition: "all 0.2s",
    },
    primaryButton: {
      backgroundColor: "#3498db",
      color: "white",
      ":hover": {
        backgroundColor: "#2980b9",
      },
    },
    dangerButton: {
      backgroundColor: "#e74c3c",
      color: "white",
      ":hover": {
        backgroundColor: "#c0392b",
      },
    },
    successMessage: {
      marginTop: "20px",
      padding: "10px",
      backgroundColor: "#e8f5e9",
      color: "#27ae60",
      borderRadius: "5px",
      textAlign: "center",
    },
  };

  // Fonction pour combiner les styles
  const combineStyles = (...styleObjects) => Object.assign({}, ...styleObjects);

  // Récupération initiale des interventions en cours
  useEffect(() => {
    const fetchInterventions = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Utilisateur non authentifié");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          "http://localhost:3000/interventions/mes-interventions",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const enCours = res.data.filter((iv) => iv.statut === "en cours");
        setInterventions(enCours);
      } catch (err) {
        console.error("❌ Erreur API:", err);
         if (err.response?.status === 403) {
    handleUnauthorized();
  } else {
    setError('Erreur lors du chargement des données');
  }
      } finally {
        setLoading(false);
      }
    };

    fetchInterventions();
  }, []);

  // Connexion WebSocket
  useEffect(() => {
    let isUnmounted = false;

    function connect() {
      if (isUnmounted) return;

      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("🟢 WebSocket connecté");
        setConnected(true);
        backoffRef.current = 500;

        const token = localStorage.getItem("token");
        if (token) {
          try {
            const decoded = jwtDecode(token);
            const userId = decoded.id || decoded._id;
            socket.send(JSON.stringify({ type: "REGISTER", userId }));
            console.log("🔐 REGISTER envoyé avec userId:", userId);
          } catch (err) {
            console.error("Erreur décodage token JWT :", err);
          }
        }
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "NOUVELLE_INTERVENTION") {
            console.log("📦 Nouvelle intervention reçue:", message.data);
            const nouvelle = message.data.intervention;
            setInterventions((prev) => [...prev, nouvelle]);
            setMessage("");
          }
        } catch (err) {
          console.error("Erreur parse message WebSocket:", err);
        }
      };

      socket.onerror = (err) => {
        console.error("WebSocket erreur:", err);
      };

      socket.onclose = (e) => {
        console.log("🔌 WebSocket fermé", e.reason || "");
        setConnected(false);
        if (!isUnmounted) {
          const delay = Math.min(backoffRef.current, 5000);
          console.log(`Reconnexion dans ${delay}ms`);
          reconnectTimeoutRef.current = setTimeout(() => {
            backoffRef.current *= 1.5;
            connect();
          }, delay);
        }
      };
    }

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  const terminerIntervention = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/interventions/${id}/terminer`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.ok) {
        setMessage("✅ Intervention terminée avec succès !");
        setInterventions((prev) => prev.filter((iv) => iv._id !== id));
      } else {
        const text = await res.text();
        console.warn("Erreur API terminer:", res.status, text);
        setError("❌ Erreur lors de la terminaison de l'intervention");
      }
    } catch (err) {
      console.error("Erreur réseau:", err);
      setError("❌ Erreur réseau ou serveur");
    }
  };

   const voirDetails = (interventionId) => {
    console.log("Voir détails pour l'intervention:", interventionId);

    navigate("/ambulancier/appels");
  };

  return (
    <div style={styles.container}>
   

      {loading ? (
        <div style={styles.loading}>Chargement en cours...</div>
      ) : error ? (
        <div style={styles.errorMessage}>{error}</div>
      ) : interventions.length === 0 ? (
        <p style={styles.noInterventions}>Aucune intervention en cours</p>
      ) : (
        <div style={styles.interventionsList}>
          {interventions.map((intervention) => (
            <div 
              key={intervention._id} 
              style={styles.interventionCard}
            >
              <div style={styles.cardHeader}>
                <h3 style={styles.patientName}>Intervention pour {intervention.patientName}</h3>
                <span style={combineStyles(
                  styles.gravityBadge,
                  intervention.gravite === "critique" ? styles.gravityCritique :
                  intervention.gravite === "urgent" ? styles.gravityMoyenne :
                  styles.gravityFaible
                )}>
                  {intervention.gravite}
                </span>
              </div>
              
              <div style={styles.cardContent}>
                <div style={styles.infoGroup}>
                  <span style={styles.infoLabel}>Localisation:</span>
                  <p style={styles.infoValue}>{intervention.localisation || "Non spécifiée"}</p>
                </div>
                
                <div style={styles.infoGroup}>
                  <span style={styles.infoLabel}>Statut:</span>
                  <p style={combineStyles(
                    styles.infoValue,
                    styles.statusText,
                    intervention.statut === "en cours" ? styles.statusEnCours : styles.statusTerminee
                  )}>
                    {intervention.statut}
                  </p>
                </div>
                
                <div style={styles.infoGroup}>
                  <span style={styles.infoLabel}>Début:</span>
                  <p style={styles.infoValue}>
                    {new Date(intervention.debutIntervention).toLocaleString()}
                  </p>
                </div>
                
                <div style={styles.infoGroup}>
                  <span style={styles.infoLabel}>Fin estimée:</span>
                  <p style={styles.infoValue}>
                    {intervention.finEstimee 
                      ? new Date(intervention.finEstimee).toLocaleString() 
                      : "Non estimée"}
                  </p>
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <button
                  style={combineStyles(styles.button, styles.primaryButton)}
                  onClick={() => voirDetails(intervention._id)}
                >
                  Voir détails
                </button>
                <button
                  style={combineStyles(styles.button, styles.dangerButton)}
                  onClick={() => terminerIntervention(intervention._id)}
                >
                  Terminer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {message && (
        <div style={styles.successMessage}>
          {message}
        </div>
      )}
    </div>
  );
}