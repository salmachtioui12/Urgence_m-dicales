/*
import React from "react";
import axios from "axios";
import "./styleCard.css"; 

const InterventionCard = ({ intervention, onUpdate }) => {
  const handleTerminer = async () => {
    try {
      await axios.put(`/interventions/${intervention._id}/statut`, {
        statut: "terminée",
      });
      alert("Intervention terminée !");
      onUpdate();
    } catch (error) {
      console.error("Erreur mise à jour :", error);
      alert(" Erreur lors de la mise à jour.");
    }
  };

  const getGraviteColor = () => {
    switch(intervention.gravite.toLowerCase()) {
      case 'faible': return '#2ecc71';
      case 'moyenne': return '#f39c12';
      case 'élevée': return '#e74c3c';
      case 'critique': return '#9b59b6';
      default: return '#3498db';
    }
  };

  return (
    <div className="intervention-card">
      <div className="card-header">
        <h3>{intervention.patientName}</h3>
        <span className={`status ${intervention.statut.replace("é", "e")}`}>
          {intervention.statut}
        </span>
      </div>
      
      <div className="card-content">
        <div className="info-item">
          <span className="icon">📍</span>
          <span>{intervention.localisation}</span>
        </div>
        
        <div className="info-item">
          <span className="icon">🚑</span>
          <span>Ambulance {intervention.ambulanceId}</span>
        </div>
        
        <div className="info-item">
          <span className="icon">⚠️</span>
          <span>
            Gravité : <span style={{ color: getGraviteColor() }}>
              {intervention.gravite}
            </span>
          </span>
        </div>
      </div>

      {intervention.statut !== "terminée" && (
        <button 
          onClick={handleTerminer} 
          className="action-btn"
        >
          Terminer l'intervention
        </button>
      )}
    </div>
  );
};

export default InterventionCard;*/