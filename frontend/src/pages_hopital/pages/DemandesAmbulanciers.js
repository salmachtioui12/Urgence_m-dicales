import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function DemandesAmbulanciers() {
  const [demandes, setDemandes] = useState([]);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

const handleUnauthorized = () => {
  localStorage.removeItem('token'); // On supprime le token
  navigate('/login');              // Redirection vers la page login
};

  useEffect(() => {
    if (user?.role === "hopital" && token) {
      const nomHopital = user.nom;

      axios
        .get(`http://localhost:3000/api/auth/demandes/ambulanciers/${nomHopital}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setDemandes(res.data);
          setError(null);
          console.log()
        })
        .catch((err) => {
          console.error(err);
        if (err.response?.status === 403) {
    handleUnauthorized();
  } else {
  setError("Impossible de charger les ambulanciers.");
  }
        });
    }
  }, [user, token]);

  const validerAmbulancier = (id) => {
    axios
      .patch(`http://localhost:3000/api/auth/valider/ambulancier/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setDemandes((prev) => prev.filter((a) => a._id !== id)))
      .catch((err) => {
        console.error(err);
        setError("Erreur lors de la validation.");
      });
  };

  const rejeterAmbulancier = (id) => {
    axios
      .patch(`http://localhost:3000/api/auth/rejeter/ambulancier/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setDemandes((prev) => prev.filter((a) => a._id !== id)))
      .catch((err) => {
        console.error(err);
        setError("Erreur lors du rejet.");
      });
  };

  // Styles inline
  const containerStyle = {
    padding: "2rem",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f6f8",
    minHeight: "100vh",
    maxWidth: "1200px",
    margin: "0 auto",
  };

  const titleStyle = {
    fontSize: "1.8rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
    color: "#2c3e50",
  };

  const cardStyle = {
    backgroundColor: "#fff",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    marginBottom: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    borderRadius:"50px",
  };

  const infoContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "2rem",
    flexWrap: "wrap",
  };

  const infoItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const labelStyle = {
    fontWeight: "bold",
    color: "#555",
  };

  const valueStyle = {
    color: "#333",
  };

  const buttonGroupStyle = {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
  };

  const buttonStyle = {
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "50px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "all 0.2s ease",
  };

  const greenButton = {
    ...buttonStyle,
    backgroundColor: "#4caf50",
    color: "#fff",
  };

  const redButton = {
    ...buttonStyle,
    backgroundColor: "#f44336",
    color: "#fff",
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Demandes d'inscription des ambulanciers</h2>
      {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}
      {demandes.length === 0 ? (
        <p>Aucune demande en attente</p>
      ) : (
        demandes.map((amb) => (
          <div key={amb._id} style={cardStyle}>
            <div style={infoContainerStyle}>
              <div style={infoItemStyle}>
                <span style={labelStyle}>Nom:</span>
                <span style={valueStyle}>{amb.nom}</span>
              </div>
              <div style={infoItemStyle}>
                <span style={labelStyle}>Email:</span>
                <span style={valueStyle}>{amb.email}</span>
              </div>
            </div>
            <div style={buttonGroupStyle}>
              <button
                style={greenButton}
                onClick={() => validerAmbulancier(amb._id)}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#388e3c")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#4caf50")}
              >
                Valider
              </button>
              <button
                style={redButton}
                onClick={() => rejeterAmbulancier(amb._id)}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#d32f2f")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#f44336")}
              >
                Rejeter
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default DemandesAmbulanciers;