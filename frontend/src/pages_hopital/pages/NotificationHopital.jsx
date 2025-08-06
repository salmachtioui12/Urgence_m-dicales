import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AppelsHopital() {
  const [appels, setAppels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchAppels = async () => {
      try {
        const response = await axios.get("http://localhost:3000/appels/hopital", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            emailHopital: user?.email,
          },
        });

        console.log("✅ Appels reçus:", response.data);
        setAppels(response.data);
        setLoading(false);
      } catch (err) {
        console.error("❌ Erreur lors de la récupération des appels:", err);
        setError("Impossible de récupérer les appels");
        setLoading(false);
      }
    };

    if (user?.email && token) {
      fetchAppels();
    }
  }, []);

  // Styles CSS en objets JavaScript
  const styles = {
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "2rem",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "3rem",
      padding: "1.5rem",
      background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      color: "white"
    },
    title: {
      fontSize: "1.8rem",
      fontWeight: "600",
      color: "white",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      margin: 0
    },
    countBadge: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      color: "white",
      borderRadius: "9999px",
      padding: "0.25rem 0.75rem",
      fontSize: "0.9rem",
      fontWeight: "500",
      marginLeft: "0.5rem"
    },
    emptyState: {
      textAlign: "center",
      padding: "2rem",
      backgroundColor: "#f8fafc",
      borderRadius: "0.5rem",
      color: "#718096",
      fontSize: "1.1rem",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
    },
    card: {
      backgroundColor: "white",
      borderRadius: "0.5rem",
      padding: "1.5rem",
      marginBottom: "1rem",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      borderLeft: "4px solid #4299e1",
      transition: "all 0.2s ease",
      ":hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }
    },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1rem",
      flexWrap: "wrap",
      gap: "0.5rem"
    },
    cardId: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#4a5568"
    },
    statusBadge: {
      padding: "0.25rem 0.75rem",
      borderRadius: "9999px",
      fontSize: "0.85rem",
      fontWeight: "600",
      textTransform: "capitalize"
    },
    detailRow: {
      display: "flex",
      marginBottom: "0.75rem",
      fontSize: "0.95rem",
      flexWrap: "wrap"
    },
    detailLabel: {
      fontWeight: "600",
      color: "#4a5568",
      minWidth: "150px",
      marginRight: "1rem"
    },
    detailValue: {
      color: "#2d3748",
      flex: 1
    },
    loading: {
      textAlign: "center",
      padding: "2rem",
      color: "#4a5568",
      fontSize: "1.1rem"
    },
    error: {
      textAlign: "center",
      padding: "2rem",
      color: "#e53e3e",
      fontWeight: "600",
      fontSize: "1.1rem"
    },
    // Styles pour les différents états
    statusColors: {
      en_attente: {
        backgroundColor: "#fefcbf",
        color: "#975a16"
      },
      en_cours: {
        backgroundColor: "#bee3f8",
        color: "#2b6cb0"
      },
      termine: {
        backgroundColor: "#c6f6d5",
        color: "#276749"
      },
      annule: {
        backgroundColor: "#fed7d7",
        color: "#9b2c2c"
      }
    },
    // Styles pour les niveaux de gravité
    severityColors: {
      critique: {
        color: "#e53e3e",
        fontWeight: "600"
      },
      urgent: {
        color: "#dd6b20",
        fontWeight: "600"
      },
      normal: {
        color: "#38a169",
        fontWeight: "600"
      }
    }
  };

  if (loading) return <div style={styles.loading}>Chargement des appels...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  const getStatusStyle = (status) => {
    const statusKey = status?.toLowerCase().replace(/ /g, '_') || 'en_attente';
    return {
      ...styles.statusBadge,
      ...(styles.statusColors[statusKey] || styles.statusColors.en_attente)
    };
  };

  const getSeverityStyle = (severity) => {
    const severityKey = severity?.toLowerCase() || 'normal';
    return styles.severityColors[severityKey] || styles.severityColors.normal;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          Derniers appels reçus
          {appels.length > 0 && <span style={styles.countBadge}>{appels.length}</span>}
        </h1>
      </div>

      {appels.length === 0 ? (
        <div style={styles.emptyState}>
          Aucun appel enregistré pour votre hôpital.
        </div>
      ) : (
        appels.map((appel) => (
          <div key={appel._id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardId}>Appel #{appel._id.slice(-5)}</span>
              <span style={getStatusStyle(appel.etat)}>
                {appel.etat || "En attente"}
              </span>
            </div>

            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Patient:</span>
              <span style={styles.detailValue}>
                {appel.patientName || "Inconnu"}
              </span>
            </div>

            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Localisation:</span>
              <span style={styles.detailValue}>
                {appel.localisation || "Non précisé"}
              </span>
            </div>

            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Gravité:</span>
              <span style={{...styles.detailValue, ...getSeverityStyle(appel.gravite)}}>
                {appel.gravite || "Non précisé"}
              </span>
            </div>

            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Heure:</span>
              <span style={styles.detailValue}>
                {new Date(appel.heureAppel).toLocaleString()}
              </span>
            </div>

            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Ambulance:</span>
              <span style={styles.detailValue}>
                {appel.ambulanceAffectee || "Aucune affectée"}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}