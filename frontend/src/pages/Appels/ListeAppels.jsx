import React, { useEffect, useState } from "react";
import "./ListeAppels.css";

export default function ListeAppels() {
  // --- États principaux du composant ---
  const [appels, setAppels] = useState([]); // Stocke la liste brute des appels récupérés depuis l'API
  const [filtre, setFiltre] = useState({    // Stocke les filtres appliqués par l'utilisateur
    gravite: "",
    etat: "",
    localisation: "",
    dateHeureMin: "",
  });
  const [appelsFiltres, setAppelsFiltres] = useState([]); // Liste des appels filtrés
  const [isLoading, setIsLoading] = useState(true);       // Indique si les données sont en cours de chargement
  const [selectedAppel, setSelectedAppel] = useState(null); // Appel sélectionné pour l'affichage dans le modal
  const [showModal, setShowModal] = useState(false);        // Gère l'ouverture/fermeture du modal
  const [activeTab, setActiveTab] = useState("patient");    // Onglet actif dans le modal

  // --- Fonction utilitaire pour gérer les textes en arabe/hébreu ---
  const isRTL = (text) => {
    if (!text) return false;
    const rtlChars = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    return rtlChars.test(text);
  };

  // --- Fonction pour récupérer les appels depuis le backend ---
  const fetchAppels = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:3000/appels"); // API REST locale
      const data = await res.json();
      setAppels(data);  // On stocke les appels récupérés
      setIsLoading(false);
    } catch (err) {
      console.error("Erreur fetch appels:", err);
      setIsLoading(false);
    }
  };

  // --- useEffect pour charger les appels au montage du composant ---
  useEffect(() => {
    fetchAppels();
  }, []);

  // --- useEffect pour filtrer et trier les appels dès qu'ils changent ---
  useEffect(() => {
    const resultats = appels.filter((appel) => {
      const matchGravite = !filtre.gravite || appel.gravite === filtre.gravite;
      const matchEtat = !filtre.etat || appel.etat === filtre.etat;
      const matchLocalisation =
        !filtre.localisation || 
        appel.localisation.toLowerCase().includes(filtre.localisation.toLowerCase());
      const matchDateHeure =
        !filtre.dateHeureMin || 
        new Date(appel.heureAppel) >= new Date(filtre.dateHeureMin);
      
      return matchGravite && matchEtat && matchLocalisation && matchDateHeure;
    });

    // Trie les appels par date décroissante (les plus récents en premier)
    const resultatsTries = [...resultats].sort((a, b) => 
      new Date(b.heureAppel) - new Date(a.heureAppel)
    );

    setAppelsFiltres(resultatsTries);
  }, [filtre, appels]);

  // --- Couleurs associées à chaque gravité ---
  const graviteColors = {
    critique: "#e74c3c",
    moyenne: "#e67e22",
    faible: "#27ae60",
  };

  // --- Formatage de la date ---
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    };
    return new Date(dateString).toLocaleString('fr-FR', options);
  };

  // --- Calcul de la durée d'une intervention ---
  const getDureeIntervention = (intervention) => {
    if (!intervention?.debutIntervention) return "N/A";
    
    const debut = new Date(intervention.debutIntervention);
    const fin = intervention.finIntervention ? 
      new Date(intervention.finIntervention) : 
      new Date();
    
    const diffMs = fin - debut;
    const diffMins = Math.round(diffMs / 60000);
    
    return `${diffMins} min`;
  };

  // --- Affichage des infos ambulance ---
  const getAmbulanceInfo = (appel) => {
    if (!appel.ambulanceAffectee) return "Aucune ambulance affectée";
    return `Ambulance ${appel.ambulanceAffectee.type} (ID: ${appel.ambulanceAffectee.id})`;
  };

  // --- Gestion du clic sur "Plus de détails" ---
  const handleShowDetails = (appel) => {
    setSelectedAppel(appel);
    setShowModal(true);
    setActiveTab("patient"); // Par défaut, on ouvre sur l'onglet patient
  };

  // --- Fermeture du modal ---
  const closeModal = () => {
    setShowModal(false);
    setSelectedAppel(null);
  };

  // --- Écran de chargement ---
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Chargement des appels...</p>
      </div>
    );
  }

  return (
    <div className="liste-appels-container">
      {/* --- En-tête --- */}
      <div className="header">
        <h2 className="header-title">Liste des Appels d'Urgence</h2>
      </div>

      {/* --- Filtres --- */}
      <div className="filtres-container">
        {/* Filtre gravité */}
        <select
          value={filtre.gravite}
          onChange={(e) => setFiltre({ ...filtre, gravite: e.target.value })}
          className="filtre-select"
        >
          <option value="">Gravité (toutes)</option>
          <option value="critique">Critique</option>
          <option value="moyenne">Moyenne</option>
          <option value="faible">Faible</option>
        </select>

        {/* Filtre état */}
        <select
          value={filtre.etat}
          onChange={(e) => setFiltre({ ...filtre, etat: e.target.value })}
          className="filtre-select"
        >
          <option value="">État (tous)</option>
          <option value="en attente">En attente</option>
          <option value="en intervention">En intervention</option>
          <option value="terminée">Terminée</option>
        </select>

        {/* Filtre localisation */}
        <input
          type="text"
          placeholder="Rechercher localisation"
          value={filtre.localisation}
          onChange={(e) => setFiltre({ ...filtre, localisation: e.target.value })}
          className="filtre-input"
        />

        {/* Filtre par date */}
        <input
          type="datetime-local"
          value={filtre.dateHeureMin}
          onChange={(e) => setFiltre({ ...filtre, dateHeureMin: e.target.value })}
          className="filtre-input"
          title="Filtrer à partir de cette date et heure"
        />
      </div>

      {/* --- Statistiques générales --- */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total</h3>
          <p>{appels.length}</p>
        </div>
        <div className="stat-card">
          <h3>En attente</h3>
          <p>{appels.filter(a => a.etat === "en attente").length}</p>
        </div>
        <div className="stat-card">
          <h3>En cours</h3>
          <p>{appels.filter(a => a.etat === "en intervention").length}</p>
        </div>
        <div className="stat-card">
          <h3>Terminés</h3>
          <p>{appels.filter(a => a.etat === "terminée").length}</p>
        </div>
      </div>

      <div className="liste-appels-cards">
        {appelsFiltres.length === 0 ? (
          <div className="no-appels">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>Aucun appel trouvé</h3>
            <p>Aucun appel ne correspond aux filtres sélectionnés</p>
          </div>
        ) : (
          appelsFiltres.map((appel) => (
            <div
              key={appel._id}
              className={`appel-card ${appel.etat.replace(/\s+/g, '-')}`}
            >
              <div className="appel-header">
                <h3>
                  {appel.patientName || "Patient anonyme"}
                  {appel.notifie && <span className="notifie-badge">Notifié</span>}
                </h3>
                <span
                  className="appel-gravite"
                  data-gravite={appel.gravite}
                  style={{
                    backgroundColor: graviteColors[appel.gravite] + "22",
                    color: graviteColors[appel.gravite],
                  }}
                >
                  {appel.gravite.toUpperCase()}
                </span>
              </div>

              <div className="appel-content">
                <p className="appel-description">{appel.description || "Aucune description fournie"}</p>

                <div className="appel-infos">
                  <div className="info-row">
                    <strong>Localisation:</strong>
                    <span className="localisation-text" dir={isRTL(appel.localisation) ? "rtl" : "ltr"}>
                      {appel.localisation || "Inconnue"}
                    </span>
                  </div>
                  
                  <div className="info-row">
                    <strong>Heure appel:</strong>
                    <span>{formatDate(appel.heureAppel)}</span>
                  </div>
                  
                  <div className="info-row">
                    <strong>État:</strong>
                    <span className={`appel-etat ${appel.etat.replace(/\s+/g, '-')}`}>
                      {appel.etat}
                    </span>
                  </div>
                  
                  <div className="info-row">
                    <strong>Ambulance:</strong>
                    <span>{getAmbulanceInfo(appel)}</span>
                  </div>
                </div>
              </div>

              <div className="appel-footer">
                <button 
                  className="btn-details"
                  onClick={() => handleShowDetails(appel)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 19C14.2091 19 16.2091 17.6569 17.6274 15.5C18.3656 14.3112 18.3656 12.6888 17.6274 11.5C16.2091 9.34315 14.2091 8 12 8C9.79086 8 7.79086 9.34315 6.37258 11.5C5.63439 12.6888 5.63439 14.3112 6.37258 15.5C7.79086 17.6569 9.79086 19 12 19Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Plus de détails
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && selectedAppel && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>×</button>
            <h3>Détails complets de l'appel</h3>
            
            <div className="modal-tabs">
              <button 
                className={`modal-tab ${activeTab === "patient" ? "active" : ""}`}
                onClick={() => setActiveTab("patient")}
              >
                Informations patient
              </button>
              
              {selectedAppel.ambulanceAffectee && (
                <button 
                  className={`modal-tab ${activeTab === "ambulance" ? "active" : ""}`}
                  onClick={() => setActiveTab("ambulance")}
                >
                  Ambulance
                </button>
              )}
              
              {selectedAppel.interventions?.length > 0 && (
                <button 
                  className={`modal-tab ${activeTab === "intervention" ? "active" : ""}`}
                  onClick={() => setActiveTab("intervention")}
                >
                  Intervention
                </button>
              )}
              {selectedAppel.ambulanceAffectee?.hopitalId && (
  <button 
    className={`modal-tab ${activeTab === "hopital" ? "active" : ""}`}
    onClick={() => setActiveTab("hopital")}
  >
    Hôpital
  </button>
)}
            </div>
            
            <div className="modal-tab-content">
              {activeTab === "patient" && (
                <div className="modal-section">
                  <h4>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Informations patient
                  </h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Nom:</strong> 
                      <span>{selectedAppel.patientName || "Inconnu"}</span>
                    </div>
                    <div className="info-item">
                      <strong>Localisation:</strong> 
                      <span>{selectedAppel.localisation}</span>
                    </div>
                    <div className="info-item">
                      <strong>Heure appel:</strong> 
                      <span>{formatDate(selectedAppel.heureAppel)}</span>
                    </div>
                    <div className="info-item">
                      <strong>Gravité:</strong> 
                      <span style={{color: graviteColors[selectedAppel.gravite]}}>
                        {selectedAppel.gravite}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ambulance" && selectedAppel.ambulanceAffectee && (
                <div className="modal-section">
                  <h4>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 7H5C3.89543 7 3 7.89543 3 9V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7H16M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7M8 7H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 14V14.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Ambulance affectée
                  </h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Type:</strong> 
                      <span>{selectedAppel.ambulanceAffectee.type}</span>
                    </div>
                    <div className="info-item">
                      <strong>ID:</strong> 
                      <span>{selectedAppel.ambulanceAffectee.id}</span>
                    </div>
                    <div className="info-item">
                      <strong>Destination:</strong> 
                      <span>{selectedAppel.ambulanceAffectee.destination}</span>
                    </div>
                    <div className="info-item">
                      <strong>État:</strong> 
                      <span>{selectedAppel.ambulanceAffectee.etat}</span>
                    </div>
                    <div className="info-item">
                      <strong>Statut:</strong> 
                      <span>{selectedAppel.ambulanceAffectee.statut}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "intervention" && selectedAppel.interventions?.length > 0 && (
                <div className="modal-section">
                  <h4>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8V12L15 15M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Intervention
                  </h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Début:</strong> 
                      <span>{formatDate(selectedAppel.interventions[0].debutIntervention)}</span>
                    </div>
                    {selectedAppel.interventions[0].finIntervention && (
                      <div className="info-item">
                        <strong>Fin:</strong> 
                        <span>{formatDate(selectedAppel.interventions[0].finIntervention)}</span>
                      </div>
                    )}
                    <div className="info-item">
                      <strong>Durée:</strong> 
                      <span>{getDureeIntervention(selectedAppel.interventions[0])}</span>
                    </div>
                    <div className="info-item">
                      <strong>Statut:</strong> 
                      <span>{selectedAppel.interventions[0].statut}</span>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "hopital" && selectedAppel.ambulanceAffectee?.hopitalId && (
  <div className="modal-section">
    <h4>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 9H15V15H9V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Informations de l'hôpital
    </h4>
    <div className="info-grid">
      <div className="info-item">
        <strong>Nom:</strong> 
        <span>{selectedAppel.ambulanceAffectee.hopitalId.nom}</span>
      </div>
      <div className="info-item">
        <strong>Adresse:</strong> 
        <span>{selectedAppel.ambulanceAffectee.hopitalId.adresse}</span>
      </div>
      <div className="info-item">
        <strong>Téléphone urgence:</strong> 
        <span>{selectedAppel.ambulanceAffectee.hopitalId.contact.telephoneUrgence}</span>
      </div>
      <div className="info-item">
        <strong>Téléphone secondaire:</strong> 
        <span>{selectedAppel.ambulanceAffectee.hopitalId.contact.telephoneSecondaire}</span>
      </div>
      <div className="info-item">
        <strong>Email:</strong> 
        <span>{selectedAppel.ambulanceAffectee.hopitalId.contact.email}</span>
      </div>
      <div className="info-item">
        <strong>Responsable:</strong> 
        <span>{selectedAppel.ambulanceAffectee.hopitalId.responsable.nom}</span>
      </div>
      <div className="info-item">
        <strong>Contact responsable:</strong> 
        <span>{selectedAppel.ambulanceAffectee.hopitalId.responsable.contact}</span>
      </div>
      <div className="info-item">
        <strong>Lits disponibles:</strong> 
        <span>{selectedAppel.ambulanceAffectee.hopitalId.capacites.lits}</span>
      </div>
      <div className="info-item">
        <strong>Salles d'opération:</strong> 
        <span>{selectedAppel.ambulanceAffectee.hopitalId.capacites.sallesOperation}</span>
      </div>
    </div>
  </div>
)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}