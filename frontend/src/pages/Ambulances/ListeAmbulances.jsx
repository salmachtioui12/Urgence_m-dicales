// Import React et hooks, Axios pour les requêtes HTTP et icônes
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaHospitalSymbol, FaMapMarkerAlt } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import "./ListeAmbulances.css";

// Composant pour afficher la liste des ambulances avec filtres
export default function ListeAmbulances() {
  // States pour stocker toutes les ambulances, celles filtrées, le filtre en cours, loading et erreur
  const [ambulances, setAmbulances] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filtre, setFiltre] = useState({ 
    type: "", 
    etat: "", 
    hopital: "" 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupération des ambulances depuis l'API au montage du composant
  useEffect(() => {
    const fetchAmbulances = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/api/ambulances");
        setAmbulances(data);  // Stockage de toutes les ambulances
        setFiltered(data);    // Initialisation du filtre avec toutes les ambulances
        setLoading(false);    // Fin du loading
      } catch (err) {
        console.error("Erreur fetch ambulances:", err);
        setError("Erreur lors du chargement des ambulances");
        setLoading(false);
      }
    };
    fetchAmbulances();
  }, []);

  // Application du filtre à chaque modification du filtre ou des ambulances
  useEffect(() => {
    const resultats = ambulances.filter((amb) => {
      const matchType = !filtre.type || amb.type === filtre.type; // filtre type
      const matchEtat = !filtre.etat || amb.etat === filtre.etat;  // filtre état
      const matchHopital =
        !filtre.hopital ||
        amb.hopitalId?.nom?.toLowerCase().includes(filtre.hopital.toLowerCase()); // filtre hôpital
      return matchType && matchEtat && matchHopital;
    });
    setFiltered(resultats); // Mise à jour des ambulances filtrées
  }, [filtre, ambulances]);

  // Affichage loading
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Rendu principal
  return (
    <div className="container">
      {/* Titre */}
      <div className="header">
        <h2 className="header-title">Liste des Ambulances</h2>
      </div>

      {/* Filtres */}
      <div className="filters-container">
        {/* Filtre type */}
        <div className="filter-group">
          <select
            value={filtre.type}
            onChange={(e) => setFiltre({ ...filtre, type: e.target.value })}
          >
            <option value="">Type (tous)</option>
            <option value="A">Type A</option>
            <option value="B">Type B</option>
            <option value="C">Type C</option>
          </select>
        </div>

        {/* Filtre état */}
        <div className="filter-group">
          <select
            value={filtre.etat}
            onChange={(e) => setFiltre({ ...filtre, etat: e.target.value })}
          >
            <option value="">État (tous)</option>
            <option value="disponible">Disponible</option>
            <option value="en mission">En mission</option>
            <option value="maintenance">En maintenance</option>
          </select>
        </div>

        {/* Filtre hôpital */}
        <div className="filter-group">
          <input
            type="text"
            placeholder="Rechercher par hôpital..."
            value={filtre.hopital}
            onChange={(e) => setFiltre({ ...filtre, hopital: e.target.value })}
          />
        </div>
      </div>

      {/* Si aucune ambulance ne correspond */}
      {filtered.length === 0 ? (
        <div className="no-results">
          Aucune ambulance ne correspond aux critères de recherche
        </div>
      ) : (
        <div className="cards-container">
          {filtered.map((amb) => (
            <div key={amb._id} className="card">
              {/* Indicateur d'état */}
              <div className={`status-indicator ${amb.etat.replace(' ', '-')}`}></div>
              
              {/* Header de la carte */}
              <div className="card-header">
                <h3>Ambulance #{amb.id}</h3>
                <span className={`status-badge ${amb.etat.replace(' ', '-')}`}>
                  {amb.etat}
                </span>
              </div>
              
              {/* Corps de la carte */}
              <div className="card-body">
                {/* Type d'ambulance */}
                <div className="card-field">
                  <span className="field-label">Type:</span>
                  <span className="field-value">{amb.type}</span>
                </div>
                
                {/* Destination si en mission */}
                {amb.etat === "en mission" && amb.destination && (
                  <div className="card-field">
                    <span className="field-label">Destination:</span>
                    <span className="field-value">
                      <FaMapMarkerAlt className="field-icon" />
                      <span>{amb.destination}</span>
                    </span>
                  </div>
                )}
                
                {/* Hôpital */}
                <div className="card-field">
                  <span className="field-label">Hôpital:</span>
                  <span className="field-value">
                    <FaHospitalSymbol className="field-icon" />
                    <span>{amb.hopitalId?.nom || "Non affectée"}</span>
                  </span>
                </div>
                
                {/* Position */}
                <div className="card-field">
                  <span className="field-label">Position:</span>
                  <span className="field-value">
                    <MdLocationOn className="field-icon" />
                    <span>
                      {amb.position 
                        ? `${amb.position.lat.toFixed(3)}, ${amb.position.lng.toFixed(3)}` 
                        : "Inconnue"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
