import React, { useEffect, useState } from "react";
import './ListeHopitaux.css';

export default function ListeHopitaux() {
  const [hopitaux, setHopitaux] = useState([]);
  const [filtreNom, setFiltreNom] = useState("");
  const [expandedHopitalId, setExpandedHopitalId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({ message: "", onConfirm: () => {} });
  const [statistiques, setStatistiques] = useState(null);
  const [statistiquesHopitalId, setStatistiquesHopitalId] = useState(null);

  const fetchHopitaux = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/hopitaux/stocks`);
      const data = await res.json();
      setHopitaux(data);
    } catch (err) {
      showAlert("Erreur lors du chargement des hôpitaux: " + err.message);
    }
  };

  const fetchStatistiques = async (hopitalId) => {
    try {
      const res = await fetch(`http://localhost:3000/stats/hopital/${hopitalId}`);
      const data = await res.json();
      setStatistiques(data);
      setStatistiquesHopitalId(hopitalId);
    } catch (err) {
      showAlert("Erreur lors du chargement des statistiques: " + err.message);
    }
  };

  useEffect(() => {
    fetchHopitaux();
  }, []);

  const showAlert = (message) => {
    setDialogConfig({ message, onConfirm: () => setShowConfirmDialog(false) });
    setShowConfirmDialog(true);
  };

  const showConfirm = (message, onConfirm) => {
    setDialogConfig({
      message,
      onConfirm: () => { onConfirm(); setShowConfirmDialog(false); }
    });
    setShowConfirmDialog(true);
  };

  const hopitauxFiltres = hopitaux.filter((h) =>
    !filtreNom || (h.nom && h.nom.toLowerCase().includes(filtreNom.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = hopitauxFiltres.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(hopitauxFiltres.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  function toggleDetails(id) {
    setExpandedHopitalId(expandedHopitalId === id ? null : id);
    if (expandedHopitalId !== id) setStatistiquesHopitalId(null);
  }

  async function deleteHopital(id) {
    showConfirm("Confirmez-vous la suppression de cet hôpital ?", async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/hopitaux/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Erreur lors de la suppression");
        await fetchHopitaux();
      } catch (err) {
        showAlert(err.message);
      }
    });
  }

  const getStatusBadgeClass = (statut) => {
    if (!statut) return 'status-badge inconnu';
    
    // Normalise le statut (minuscules, remplace espaces/tirets par underscores)
    const normalizedStatut = statut.toLowerCase()
      .replace(/[- ]/g, '_')
      .replace(/[éèê]/g, 'e');
    
    switch(normalizedStatut) {
      case 'disponible':
      case 'actif':
      case 'approuve':
      case 'approuvé':
        return 'status-badge disponible';
      
      case 'en_intervention':
      case 'en_mission':
      case 'en_attente':
        return 'status-badge en-intervention';
      
      case 'hors_service':
      case 'inactif':
      case 'rejete':
      case 'rejeté':
        return 'status-badge hors-service';
      
      case 'en_maintenance':
      case 'en_conge':
      case 'en_congé':
        return 'status-badge en-maintenance';
      
      default:
        return 'status-badge inconnu';
    }
  };

  const getTypeBadgeClass = (type) => {
    if (!type) return 'status-type inconnu';
    
    const normalizedType = type.toLowerCase()
      .replace(/[éèê]/g, 'e')
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    switch(normalizedType) {
      case 'medicalisee':
      case 'medicalisée':
        return 'status-type medicalisee';
      case 'urgence':
        return 'status-type urgence';
      case 'transport':
        return 'status-type transport';
      default:
        return 'status-type inconnu';
    }
  };

  return (
    <div className="liste-hopitaux-container">
      {showConfirmDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-message">{dialogConfig.message}</div>
            <div className="confirm-buttons">
              <button onClick={() => setShowConfirmDialog(false)} className="confirm-cancel">Annuler</button>
              <button onClick={dialogConfig.onConfirm} className="confirm-ok">Confirmer</button>
            </div>
          </div>
        </div>
      )}

      <div className="header-container">
        <div className="header">
          <h2 className="header-title">Liste des Hôpitaux</h2>
          <div className="filter-container">
            <input
              type="text"
              placeholder="Filtrer par nom"
              value={filtreNom}
              onChange={(e) => { setFiltreNom(e.target.value); setCurrentPage(1); }}
              className="filter-input"
            />
          </div>
        </div>
      </div>

      <div className="hopitaux-list">
        {currentItems.length === 0 ? (
          <p className="no-results">Aucun hôpital trouvé.</p>
        ) : (
          currentItems.map((h) => (
            <div key={h._id} className="hopital-card">
              <div className="hopital-header">
                <h3>{h.nom}</h3>
                <div className="hopital-buttons">
                  <button onClick={() => toggleDetails(h._id)} className="details-btn">
                    {expandedHopitalId === h._id ? "Masquer" : "Détails"}
                  </button>
                  <button onClick={() => fetchStatistiques(h._id)} className="stats-btn">Statistiques</button>
                </div>
              </div>

              <p className="adresse">{h.adresse ?? "Adresse inconnue"}</p>

              {expandedHopitalId === h._id && (
                <div className="detailed-info">
                  <div className="info-section">
                    <h4>Contact</h4>
                    <ul>
                      <li><strong>Téléphone urgence:</strong> {h.contact?.telephoneUrgence || "Non renseigné"}</li>
                      <li><strong>Téléphone secondaire:</strong> {h.contact?.telephoneSecondaire || "Non renseigné"}</li>
                      <li><strong>Email:</strong> {h.contact?.email || "Non renseigné"}</li>
                      <li><strong>Site web:</strong> {h.contact?.siteWeb || "Non renseigné"}</li>
                    </ul>
                  </div>

                  <div className="info-section">
                    <h4>Capacités</h4>
                    <ul>
                      <li><strong>Nombre de lits:</strong> {h.capacites?.lits || "Non renseigné"}</li>
                      <li><strong>Salles d'opération:</strong> {h.capacites?.sallesOperation || "Non renseigné"}</li>
                      <li><strong>Service d'urgence:</strong> {h.capacites?.urgenceDisponible ? "Disponible" : "Non disponible"}</li>
                      <li><strong>Heures d'ouverture:</strong> {h.capacites?.heuresOuverture || "Non renseigné"}</li>
                    </ul>
                  </div>

                  <div className="info-section">
                    <h4>Localisation</h4>
                    <ul>
                      <li><strong>Latitude:</strong> {h.position?.lat?.toFixed(4) || "Inconnue"}</li>
                      <li><strong>Longitude:</strong> {h.position?.lng?.toFixed(4) || "Inconnue"}</li>
                      <li><strong>Région:</strong> {h.region || "Non renseignée"}</li>
                    </ul>
                  </div>
                </div>
              )}

              {statistiquesHopitalId === h._id && statistiques && (
                <div className="statistiques-section">
                  <h4>Statistiques de l'hôpital</h4>

                  <div className="stats-grid">
                    <div className="stats-card">
                      <h5>Interventions par gravité</h5>
                      <ul>
                        {statistiques.interventionsParGravite?.map((item, idx) => (
                          <li key={idx}>
                            <span className="stat-label">{item._id}:</span> 
                            <span className="stat-value">{item.total}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="stats-card">
                      <h5>Interventions par statut</h5>
                      <ul>
                        {statistiques.interventionsParStatut?.map((item, idx) => (
                          <li key={idx}>
                            <span className="stat-label">{item._id}:</span> 
                            <span className="stat-value">{item.total}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="stats-card">
                      <h5>Durée moyenne</h5>
                      <div className="duration-display">
                        {Math.floor(statistiques.dureeMoyenne / 60000)} min
                      </div>
                    </div>

                    <div className="stats-card">
                      <h5>Ambulances</h5>
                      <ul>
                        {statistiques.ambulancesStatut?.map((item, idx) => (
                          <li key={idx}>
                            <span className="stat-label">{item._id}:</span> 
                            <span className="stat-value">{item.total}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="stats-card full-width">
                      <h5>Détails des ambulances</h5>
                      <table className="ambulances-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Type</th>
                            <th>État</th>
                            <th>Position</th>
                            <th>Destination</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statistiques.ambulances?.map((ambulance, idx) => (
                            <tr key={idx}>
                              <td>{ambulance.id}</td>
                              <td>
                                <span className={getTypeBadgeClass(ambulance.type)}>
                                  {ambulance.type}
                                </span>
                              </td>
                              <td>
                                <span className={getStatusBadgeClass(ambulance.etat)}>
                                  {ambulance.etat}
                                </span>
                              </td>
                              <td>
                                {ambulance.position?.lat && ambulance.position?.lng 
                                  ? `${ambulance.position.lat.toFixed(4)}, ${ambulance.position.lng.toFixed(4)}`
                                  : 'Non disponible'}
                              </td>
                              <td>{ambulance.destination || 'Aucune'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="stats-card full-width">
                      <h5>Ambulanciers ({statistiques.totalAmbulanciers})</h5>
                      <table className="ambulanciers-table">
                        <thead>
                          <tr>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statistiques.ambulanciers?.map((ambulancier, idx) => (
                            <tr key={idx}>
                              <td>{ambulancier.nom}</td>
                              <td>{ambulancier.prenom || '-'}</td>
                              <td>{ambulancier.email}</td>
                              <td>{ambulancier.telephone || '-'}</td>
                              <td>
                                <span className={getStatusBadgeClass(ambulancier.statut)}>
                                  {ambulancier.statut}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {statistiques.appels?.length > 0 && (
                      <div className="stats-card full-width">
                        <h5>Appels récents ({statistiques.appels.length})</h5>
                        <table className="appels-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Type</th>
                              <th>Gravité</th>
                            </tr>
                          </thead>
                          <tbody>
                            {statistiques.appels.map((appel, idx) => (
                              <tr key={idx}>
                                <td>{new Date(appel.date).toLocaleString()}</td>
                                <td>{appel.type || 'Non spécifié'}</td>
                                <td className={`gravite-${appel.gravite?.toLowerCase()}`}>
                                  {appel.gravite || 'Inconnue'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {hopitauxFiltres.length > itemsPerPage && (
        <div className="pagination">
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="page-btn">&lt;</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <button key={number} onClick={() => paginate(number)} className={`page-btn ${currentPage === number ? 'active' : ''}`}>{number}</button>
          ))}
          <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="page-btn">&gt;</button>
        </div>
      )}
    </div>
  );
}