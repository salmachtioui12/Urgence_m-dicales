
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles.css";

const ListeInterventions = () => {
  const [interventions, setInterventions] = useState([]);
  const [filtreGravite, setFiltreGravite] = useState("toutes");
  const [filtreLocalisation, setFiltreLocalisation] = useState("");
  const [filtreDate, setFiltreDate] = useState("");

  const fetchInterventions = async () => {
    try {
      const { data } = await axios.get("http://localhost:3000/interventions/en-cours");
      setInterventions(data);
    } catch (err) {
      console.error("Erreur récupération :", err);
    }
  };

  const terminerIntervention = async (id) => {
    try {
      await axios.put(`http://localhost:3000/interventions/${id}/finish`, {
        statut: "terminée",
      });
      fetchInterventions();
    } catch (err) {
      console.error("Erreur lors de la mise à jour :", err);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, []);

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

  return (
    <div className="interventions-container">
      <h2 className="page-title">Interventions en cours</h2>

      <div className="filtres-container">
        <div className="filtre-group">
          <select
            id="filtreGravite"
            value={filtreGravite}
            onChange={(e) => setFiltreGravite(e.target.value)}
          >
            <option value="toutes">Toutes les gravités</option>
            <option value="critique">Critique</option>
            <option value="moyenne">Moyenne</option>
            <option value="faible">Faible</option>
          </select>
        </div>

        <div className="filtre-group">
          <input
            type="text"
            id="filtreLocalisation"
            placeholder="Rechercher par localisation"
            value={filtreLocalisation}
            onChange={(e) => setFiltreLocalisation(e.target.value)}
          />
        </div>

        <div className="filtre-group">
          <input
            type="date"
            id="filtreDate"
            value={filtreDate}
            onChange={(e) => setFiltreDate(e.target.value)}
          />
        </div>
      </div>

      {interventionsFiltrees.length === 0 ? (
        <p className="no-results">Aucune intervention trouvée</p>
      ) : (
        <div className="interventions-list">
          {interventionsFiltrees.map((interv) => (
            <div key={interv._id} className="intervention-card">
              <div className="card-content">
                <div className="card-header">
                  <h3>{interv.patientName}</h3>
                  <span className={`gravite-badge ${interv.gravite.toLowerCase()}`}>
                    {interv.gravite}
                  </span>
                </div>
                
                <div className="card-details">
                  <p><span className="label">Ambulance:</span> {interv.ambulanceId?.id || "N/A"} ({interv.ambulanceId?.type})</p>
                  <p><span className="label">Localisation:</span> {interv.localisation}</p>
                  <p><span className="label">Début:</span> {new Date(interv.debutIntervention).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="card-actions">
                <button
                  onClick={() => terminerIntervention(interv._id)}
                  className="terminer-btn"
                >
                  Terminer
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