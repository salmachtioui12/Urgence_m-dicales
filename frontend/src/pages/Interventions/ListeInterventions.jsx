import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles.css";

const ListeInterventions = () => {
  // State pour stocker toutes les interventions récupérées
  const [interventions, setInterventions] = useState([]);
  // États des filtres
  const [filtreGravite, setFiltreGravite] = useState("toutes");
  const [filtreLocalisation, setFiltreLocalisation] = useState("");
  const [filtreDate, setFiltreDate] = useState("");
  // État de chargement
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour récupérer les interventions depuis l’API
  const fetchInterventions = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get("http://localhost:3000/interventions/en-cours");
      setInterventions(data);
    } catch (err) {
      console.error("Erreur récupération :", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour marquer une intervention comme "terminée"
  const terminerIntervention = async (id) => {
    try {
      await axios.put(`http://localhost:3000/interventions/${id}/finish`, {
        statut: "terminée",
      });
      fetchInterventions(); // Rafraîchit la liste
    } catch (err) {
      console.error("Erreur lors de la mise à jour :", err);
    }
  };

  // Récupération initiale des interventions au montage du composant
  useEffect(() => {
    fetchInterventions();
  }, []);

  // Filtrage des interventions en fonction des critères choisis
  const interventionsFiltrees = interventions.filter((i) => {
    const matchGravite = filtreGravite === "toutes" || i.gravite === filtreGravite;
    const matchLocalisation =
      filtreLocalisation.trim() === "" ||
      (i.localisation && i.localisation.toLowerCase().includes(filtreLocalisation.toLowerCase()));
    const matchDate =
      filtreDate === "" ||
      new Date(i.debutIntervention) >= new Date(filtreDate + "T00:00:00");

    return matchGravite && matchLocalisation && matchDate;
  });

  // Couleurs associées aux différents niveaux de gravité
  const graviteColors = {
    critique: "#e74c3c", // rouge
    moyenne: "#e67e22",  // orange
    faible: "#27ae60",   // vert
  };

  // Affiche un écran de chargement pendant la récupération des données
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Chargement des interventions...</p>
      </div>
    );
  }

  return (
    <div className="liste-interventions-container">
      <div className="header">
        <h2 className="header-title">
         
          Interventions en cours
        </h2>
      </div>

      <div className="filtres-container">
        <div className="filtre-group">
          <label>Gravité :</label>
          <select
            id="filtreGravite"
            value={filtreGravite}
            onChange={(e) => setFiltreGravite(e.target.value)}
            className="filtre-select"
          >
            <option value="toutes">Toutes les gravités</option>
            <option value="critique">Critique</option>
            <option value="moyenne">Moyenne</option>
            <option value="faible">Faible</option>
          </select>
        </div>

        <div className="filtre-group">
          <label>Localisation :</label>
          <input
            type="text"
            id="filtreLocalisation"
            placeholder="Ville, quartier..."
            value={filtreLocalisation}
            onChange={(e) => setFiltreLocalisation(e.target.value)}
            className="filtre-input"
          />
        </div>

        <div className="filtre-group">
          <label>À partir du :</label>
          <input
            type="date"
            id="filtreDate"
            value={filtreDate}
            onChange={(e) => setFiltreDate(e.target.value)}
            className="filtre-input"
          />
        </div>
      </div>

      {interventionsFiltrees.length === 0 ? (
        <div className="no-interventions">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3>Aucune intervention trouvée</h3>
          <p>Aucune intervention ne correspond aux filtres sélectionnés</p>
        </div>
      ) : (
        <div className="liste-interventions-cards">
          {interventionsFiltrees.map((interv) => (
            <div key={interv._id} className="intervention-card">
              <div className="intervention-header">
                <h3>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H9C7.93913 15 6.92172 15.4214 6.17157 16.1716C5.42143 16.9217 5 17.9391 5 19V21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {interv.patientName}
                </h3>
                <span
                  className="intervention-gravite"
                  style={{
                    backgroundColor: graviteColors[interv.gravite] + "22",
                    color: graviteColors[interv.gravite],
                  }}
                >
                  {interv.gravite.toUpperCase()}
                </span>
              </div>

              <div className="intervention-content">
                <div className="intervention-infos">
                  <div className="info-row">
                    <strong>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M8 7H5C3.89543 7 3 7.89543 3 9V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7H16M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7M8 7H16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 14V14.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Ambulance:
                    </strong>
                    <span>{interv.ambulanceId?.id || "N/A"} ({interv.ambulanceId?.type})</span>
                  </div>
                  
                  <div className="info-row">
                    <strong>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Localisation:
                    </strong>
                    <span>{interv.localisation}</span>
                  </div>
                  
                  <div className="info-row">
                    <strong>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 8V12L15 15M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Début:
                    </strong>
                    <span>{new Date(interv.debutIntervention).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="intervention-footer">
                <button
                  onClick={() => terminerIntervention(interv._id)}
                  className="btn-terminer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Terminer l'intervention
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListeInterventions;