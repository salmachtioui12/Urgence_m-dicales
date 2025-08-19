// AmbulanciersList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AmbulanciersList.css";
import { useNavigate } from 'react-router-dom';


export default function AmbulanciersList() {
  const [ambulanciers, setAmbulanciers] = useState([]);
  const [filteredAmbulanciers, setFilteredAmbulanciers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAmbulancier, setSelectedAmbulancier] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({});
  const [activeTab, setActiveTab] = useState("info");
  const navigate = useNavigate();

  // États pour les filtres
  const [filters, setFilters] = useState({
    nom: '',
    prenom: '',
    experienceMin: '',
    statut: ''
  });
  const handleUnauthorized = () => {
  localStorage.removeItem('token'); // On supprime le token
  navigate('/login');              // Redirection vers la page login
};

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchAmbulanciers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/api/ambulanciers/ambulanciers/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = Array.isArray(response.data) ? response.data : [];
        setAmbulanciers(data);
        setFilteredAmbulanciers(data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors de la récupération des ambulanciers:", err);
        setError(err.response?.data?.message || "Erreur de chargement des ambulanciers");
         if (err.response?.status === 403) {
    handleUnauthorized();
  } else {
    setError('Erreur lors du chargement des données');
  }
        setLoading(false);
      }
    };

    fetchAmbulanciers();
  }, []);

  // Appliquer les filtres
  useEffect(() => {
    let result = ambulanciers;
    
    if (filters.nom) {
      result = result.filter(amb => 
        amb.nom?.toLowerCase().includes(filters.nom.toLowerCase())
      );
    }
    
    if (filters.prenom) {
      result = result.filter(amb => 
        amb.prenom?.toLowerCase().includes(filters.prenom.toLowerCase())
      );
    }
    
    if (filters.experienceMin) {
      result = result.filter(amb => 
        amb.anneesExperience >= parseInt(filters.experienceMin)
      );
    }
    
    if (filters.statut) {
      result = result.filter(amb => 
        amb.statut === filters.statut
      );
    }
    
    setFilteredAmbulanciers(result);
    setCurrentPage(1); // Réinitialiser à la première page lors du filtrage
  }, [filters, ambulanciers]);

  // Calcul de la pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAmbulanciers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAmbulanciers.length / itemsPerPage);

  const showConfirm = (message, onConfirm) => {
    setDialogConfig({
      message,
      onConfirm: () => {
        onConfirm();
        setShowConfirmDialog(false);
      },
      onCancel: () => setShowConfirmDialog(false)
    });
    setShowConfirmDialog(true);
  };

  const handleDelete = async (id) => {
    showConfirm("Êtes-vous sûr de vouloir supprimer cet ambulancier ?", async () => {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3000/api/ambulanciers/ambulancier/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAmbulanciers(ambulanciers.filter(amb => amb._id !== id));
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        setError(err.response?.data?.message || "Erreur lors de la suppression");
      }
    });
  };

  const handleShowDetails = (ambulancier) => {
    setSelectedAmbulancier(ambulancier);
    setShowModal(true);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const resetFilters = () => {
    setFilters({
      nom: '',
      prenom: '',
      experienceMin: '',
      statut: ''
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non renseignée";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const getStatusBadgeClass = (statut) => {
    switch (statut) {
      case 'disponible': return 'status-badge disponible';
      case 'en-mission': return 'status-badge en-mission';
      case 'en-conge': return 'status-badge en-conge';
      default: return 'status-badge inconnu';
    }
  };

  const getExperienceBadgeClass = (years) => {
    return years > 5 ? 'experience-badge high-exp' : 'experience-badge low-exp';
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <button onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="ambulanciers-container">
      <div className="header">
        <h2 className="headerTitle">Liste des Ambulanciers</h2>
      </div>
      
      {/* Filtres */}
      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="nom">Nom:</label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={filters.nom}
            onChange={handleFilterChange}
            placeholder="Filtrer par nom"
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="prenom">Prénom:</label>
          <input
            type="text"
            id="prenom"
            name="prenom"
            value={filters.prenom}
            onChange={handleFilterChange}
            placeholder="Filtrer par prénom"
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="experienceMin">Expérience min (ans):</label>
          <input
            type="number"
            id="experienceMin"
            name="experienceMin"
            value={filters.experienceMin}
            onChange={handleFilterChange}
            placeholder="Années min"
            min="0"
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="statut">Statut:</label>
          <select
            id="statut"
            name="statut"
            value={filters.statut}
            onChange={handleFilterChange}
          >
            <option value="">Tous</option>
            <option value="disponible">Disponible</option>
            <option value="en-mission">En mission</option>
            <option value="en-conge">En congé</option>
          </select>
        </div>
        
        <button className="reset-filters" onClick={resetFilters}>
          Réinitialiser
        </button>
      </div>
      
      {/* Résultats et pagination info */}
      <div className="results-info">
        <span>{filteredAmbulanciers.length} ambulancier(s) trouvé(s)</span>
        {filteredAmbulanciers.length > itemsPerPage && (
          <span>Page {currentPage} sur {totalPages}</span>
        )}
      </div>

      {filteredAmbulanciers.length === 0 ? (
        <div className="no-ambulanciers">
          Aucun ambulancier ne correspond aux critères de recherche
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="ambulanciers-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Expérience</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((amb) => (
                  <tr key={amb._id}>
                    <td>{amb.nom || 'N/A'}</td>
                    <td>{amb.prenom || 'N/A'}</td>
                    <td>{amb.email || 'N/A'}</td>
                    <td>{amb.telephone || 'N/A'}</td>
                    <td>
                      <span className={getExperienceBadgeClass(amb.anneesExperience || 0)}>
                        {amb.anneesExperience || 0} ans
                      </span>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(amb.statut)}>
                        {amb.statut || 'N/A'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="details-button"
                        onClick={() => handleShowDetails(amb)}
                      >
                        Détails
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDelete(amb._id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? 'active' : ''}
                >
                  {page}
                </button>
              ))}
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de détails */}
    
{showModal && selectedAmbulancier && (
  <div className="modal-overlay">
    <div className="modal">
      <div className="modal-header">
        <h2>Détails de l'ambulancier</h2>
        <button className="close-button" onClick={() => setShowModal(false)}>×</button>
      </div>
      
      <div className="modal-tabs">
        <button 
          className={`modal-tab ${activeTab === "info" ? "active" : ""}`}
          onClick={() => setActiveTab("info")}
        >
          Informations
        </button>
        
        <button 
          className={`modal-tab ${activeTab === "permis" ? "active" : ""}`}
          onClick={() => setActiveTab("permis")}
          disabled={!selectedAmbulancier.permis}
        >
          Permis
        </button>
        
        <button 
          className={`modal-tab ${activeTab === "services" ? "active" : ""}`}
          onClick={() => setActiveTab("services")}
          disabled={!selectedAmbulancier.services?.length}
        >
          Services
        </button>
        
        <button 
          className={`modal-tab ${activeTab === "certifications" ? "active" : ""}`}
          onClick={() => setActiveTab("certifications")}
          disabled={!selectedAmbulancier.certifications?.length}
        >
          Certifications
        </button>
      </div>
      
      <div className="modal-body">
        {activeTab === "info" && (
          <>
            <div className="modal-section">
              <h3>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                </svg>
                Informations Personnelles
              </h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Nom complet</span>
                  <span className="detail-value">{selectedAmbulancier.prenom || ''} {selectedAmbulancier.nom || ''}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{selectedAmbulancier.email || 'Non renseigné'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Téléphone</span>
                  <span className="detail-value">{selectedAmbulancier.telephone || 'Non renseigné'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Sexe</span>
                  <span className="detail-value">{selectedAmbulancier.sexe || 'Non renseigné'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date de naissance</span>
                  <span className="detail-value">{formatDate(selectedAmbulancier.dateNaissance)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Adresse</span>
                  <span className="detail-value">{selectedAmbulancier.adresse || 'Non renseignée'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Expérience</span>
                  <span className="detail-value">{selectedAmbulancier.anneesExperience || 0} ans</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Statut</span>
                  <span className={`detail-value ${getStatusBadgeClass(selectedAmbulancier.statut)}`}>
                    {selectedAmbulancier.statut || 'Non renseigné'}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-section">
              <h3>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/>
                  <path d="M11 7H13V9H11V7ZM11 11H13V17H11V11Z" fill="currentColor"/>
                </svg>
                Affectation
              </h3>
              {selectedAmbulancier.hopital ? (
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Hôpital</span>
                    <span className="detail-value">{selectedAmbulancier.hopital.nom}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedAmbulancier.hopital.contact?.email || 'Non renseigné'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Téléphone</span>
                    <span className="detail-value">{selectedAmbulancier.hopital.contact?.telephoneUrgence || 'Non renseigné'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Région</span>
                    <span className="detail-value">{selectedAmbulancier.hopital.region || 'Non renseignée'}</span>
                  </div>
                </div>
              ) : (
                <p className="no-data">Non affecté à un hôpital</p>
              )}
            </div>
          </>
        )}

        {activeTab === "permis" && selectedAmbulancier.permis && (
          <div className="modal-section">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM9 4H11V9L10 8.25L9 9V4ZM18 20H6V4H7V13L10 10.75L13 13V4H18V20Z" fill="currentColor"/>
              </svg>
              Permis de Conduire
            </h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Numéro</span>
                <span className="detail-value">{selectedAmbulancier.permis.numero}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Catégorie</span>
                <span className="detail-value">{selectedAmbulancier.permis.categorie}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Délivré le</span>
                <span className="detail-value">{formatDate(selectedAmbulancier.permis.dateDelivrance)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Expire le</span>
                <span className="detail-value">{formatDate(selectedAmbulancier.permis.dateExpiration)}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "services" && (
          <div className="modal-section">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2ZM12 4.47L18 6.76V11.09C18 15.09 15.45 18.79 12 19.93C8.55 18.79 6 15.1 6 11.09V6.76L12 4.47ZM12 7L8 8.5V11.18C8 13.28 9.2 15.16 11 16.18V13H13V16.18C14.8 15.16 16 13.28 16 11.18V8.5L12 7Z" fill="currentColor"/>
              </svg>
              Services ({selectedAmbulancier.services?.length || 0})
            </h3>
            {selectedAmbulancier.services?.length > 0 ? (
              <ul className="info-list">
                {selectedAmbulancier.services.map((service, index) => (
                  <li key={index}>{service}</li>
                ))}
              </ul>
            ) : (
              <p className="no-data">Aucun service spécifié</p>
            )}
          </div>
        )}

        {activeTab === "certifications" && (
          <div className="modal-section">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3L2 12V20H6V14H18V20H22V12L12 3ZM16 18H8V12H16V18ZM12 7.5L16 11H13V15H11V11H8L12 7.5Z" fill="currentColor"/>
              </svg>
              Certifications ({selectedAmbulancier.certifications?.length || 0})
            </h3>
            {selectedAmbulancier.certifications?.length > 0 ? (
              <ul className="info-list">
                {selectedAmbulancier.certifications.map((certification, index) => (
                  <li key={index}>{certification}</li>
                ))}
              </ul>
            ) : (
              <p className="no-data">Aucune certification</p>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
)}

      {/* Boîte de dialogue de confirmation */}
      {showConfirmDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <p className="confirm-message">{dialogConfig.message}</p>
            <div className="confirm-buttons">
              <button 
                className="confirm-button cancel-button"
                onClick={dialogConfig.onCancel}
              >
                Annuler
              </button>
              <button 
                className="confirm-button confirm-delete-button"
                onClick={dialogConfig.onConfirm}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }) {
  if (!value) return null;
  
  return (
    <div className="detail-item">
      <span className="detail-label">{label}:</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}