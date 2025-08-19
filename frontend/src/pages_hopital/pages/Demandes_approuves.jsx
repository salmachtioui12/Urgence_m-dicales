import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

export default function ListeAmbulanciers() {
  const [ambulanciers, setAmbulanciers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [selectedAmbulancier, setSelectedAmbulancier] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({});
const navigate = useNavigate();
const handleUnauthorized = () => {
  localStorage.removeItem('token'); // On supprime le token
  navigate('/login');              // Redirection vers la page login
};

  useEffect(() => {
    const fetchAmbulanciers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/api/ambulanciers/ambulanciers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAmbulanciers(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des ambulanciers :", error);
          if (error.response?.status === 403) {
    handleUnauthorized();
  } else {
setErreur("Impossible de charger les ambulanciers.");
  }
        
        setLoading(false);
      }
    };

    fetchAmbulanciers();
  }, []);

  const showConfirm = (message, onConfirm) => {
    setDialogConfig({
      message,
      onConfirm: () => {
        onConfirm();
        setShowConfirmDialog(false);
      }
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
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        setErreur("Impossible de supprimer l'ambulancier.");
      }
    });
  };

  const handleShowDetails = (ambulancier) => {
    setSelectedAmbulancier(ambulancier);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non renseignée";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Styles CSS en objets JavaScript
  const styles = {
    // Animation pour la modal
    modalAnimation: `
      @keyframes modalFadeIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `,
    // Animation pour le spinner
    spinnerAnimation: `
      @keyframes spin {
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }
    `,
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    header: {
      background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
      color: "white",
      padding: "20px",
      borderRadius: "8px 8px 0 0",
      marginBottom: "0"
    },
    headerTitle: {
      margin: "0",
      fontSize: "24px",
      fontWeight: "600"
    },
    noAmbulanciers: {
      textAlign: "center",
      padding: "40px",
      backgroundColor: "white",
      borderRadius: "0 0 8px 8px",
      color: "#666",
      fontSize: "16px"
    },
    tableContainer: {
      overflowX: "auto",
      backgroundColor: "white",
      borderRadius: "0 0 8px 8px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse"
    },
    tableHeader: {
      backgroundColor: "#f8fafc",
      color: "#64748b",
      textAlign: "left",
      padding: "12px 15px",
      fontSize: "14px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    tableCell: {
      padding: "12px 15px",
      borderBottom: "1px solid #e2e8f0",
      color: "#334155",
      fontSize: "14px"
    },
    tableRowHover: {
      backgroundColor: "#f0f9ff"
    },
    badge: {
      padding: "4px 8px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "600"
    },
    highExp: {
      backgroundColor: "#dcfce7",
      color: "#166534"
    },
    lowExp: {
      backgroundColor: "#fef9c3",
      color: "#854d0e"
    },
    active: {
      backgroundColor: "#dcfce7",
      color: "#166534"
    },
    inactive: {
      backgroundColor: "#fee2e2",
      color: "#991b1b"
    },
    loadingSpinner: {
      display: "inline-block",
      width: "50px",
      height: "50px",
      border: "4px solid rgba(59, 130, 246, 0.2)",
      borderRadius: "50%",
      borderTopColor: "#3b82f6",
      animation: "spin 1s ease-in-out infinite",
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)"
    },
    errorMessage: {
      padding: "15px",
      margin: "20px",
      backgroundColor: "#fee2e2",
      color: "#b91c1c",
      borderLeft: "4px solid #dc2626",
      borderRadius: "4px",
      fontSize: "16px"
    },
    button: {
      padding: "6px 12px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      marginRight: "5px"
    },
    detailButton: {
      backgroundColor: "#3b82f6",
      color: "white"
    },
    deleteButton: {
      backgroundColor: "#ef4444",
      color: "white"
    },
    // Nouveaux styles pour la modal
    modal: {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "1000",
      backdropFilter: "blur(5px)"
    },
    modalContent: {
      backgroundColor: "white",
      padding: "25px",
      borderRadius: "12px",
      maxWidth: "700px",
      width: "90%",
      maxHeight: "85vh",
      overflowY: "auto",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
      border: "1px solid rgba(255, 255, 255, 0.2)"
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "25px",
      paddingBottom: "15px",
      borderBottom: "1px solid #e2e8f0"
    },
    modalTitle: {
      fontSize: "22px",
      fontWeight: "600",
      color: "#1e3a8a",
      margin: "0"
    },
    closeButton: {
      background: "none",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      color: "#64748b",
      transition: "color 0.2s",
      ":hover": {
        color: "#1e3a8a"
      }
    },
    detailRow: {
      display: "flex",
      marginBottom: "15px",
      paddingBottom: "15px",
      borderBottom: "1px solid #f1f5f9",
      ":last-child": {
        borderBottom: "none"
      }
    },
    detailLabel: {
      fontWeight: "600",
      width: "180px",
      color: "#475569",
      fontSize: "15px"
    },
    detailValue: {
      flex: "1",
      color: "#334155",
      fontSize: "15px"
    },
    // Style pour la boîte de dialogue de confirmation
    confirmDialog: {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "2000",
    },
    confirmDialogContent: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "20px",
      width: "350px",
      maxWidth: "90%",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      animation: "fadeInScale 0.3s forwards",
    },
    confirmDialogMessage: {
      marginBottom: "20px", 
      fontSize: "16px", 
      color: "#333", 
      textAlign: "center"
    },
    confirmDialogButtons: {
      display: "flex", 
      justifyContent: "center", 
      gap: "15px"
    },
    confirmDialogButton: {
      padding: "10px 20px",
      border: "none",
      borderRadius: "20px",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "all 0.2s",
    },
    confirmDialogCancelButton: {
      backgroundColor: "#ecf0f1",
      color: "#7f8c8d",
    },
    confirmDialogConfirmButton: {
      backgroundColor: "#e74c3c",
      color: "white",
    }
  };

  if (loading) return (
    <>
      <style>{styles.spinnerAnimation}</style>
      <div style={styles.loadingSpinner}></div>
    </>
  );
  
  if (erreur) return <div style={styles.errorMessage}>{erreur}</div>;

  return (
    <div style={styles.container}>
      {/* Boîte de dialogue de confirmation */}
      {showConfirmDialog && (
        <div style={styles.confirmDialog}>
          <div style={styles.confirmDialogContent}>
            <div style={styles.confirmDialogMessage}>
              {dialogConfig.message}
            </div>
            <div style={styles.confirmDialogButtons}>
              <button
                onClick={() => setShowConfirmDialog(false)}
                style={{
                  ...styles.confirmDialogButton,
                  ...styles.confirmDialogCancelButton
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#bdc3c7")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ecf0f1")}
              >
                Annuler
              </button>
              <button
                onClick={dialogConfig.onConfirm}
                style={{
                  ...styles.confirmDialogButton,
                  ...styles.confirmDialogConfirmButton
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#c0392b")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#e74c3c")}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Liste des Ambulanciers de votre Hôpital</h2>
      </div>

      {ambulanciers.length === 0 ? (
        <div style={styles.noAmbulanciers}>
          <p>Aucun ambulancier enregistré pour cet hôpital.</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Nom</th>
                <th style={styles.tableHeader}>Prénom</th>
                <th style={styles.tableHeader}>Téléphone</th>
                <th style={styles.tableHeader}>Email</th>
                <th style={styles.tableHeader}>Matricule</th>
                <th style={styles.tableHeader}>Expérience</th>
                <th style={styles.tableHeader}>Statut</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ambulanciers.map((amb) => (
                <tr key={amb._id} style={{ ':hover': styles.tableRowHover }}>
                  <td style={styles.tableCell}>{amb.nom}</td>
                  <td style={styles.tableCell}>{amb.prenom}</td>
                  <td style={styles.tableCell}>{amb.telephone}</td>
                  <td style={styles.tableCell}>{amb.email}</td>
                  <td style={styles.tableCell}>{amb.matricule}</td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.badge,
                      ...(amb.anneesExperience > 5 ? styles.highExp : styles.lowExp)
                    }}>
                      {amb.anneesExperience} ans
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.badge,
                      ...(amb.statut === 'actif' ? styles.active : styles.inactive)
                    }}>
                      {amb.statut}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <button 
                      style={{ ...styles.button, ...styles.detailButton }}
                      onClick={() => handleShowDetails(amb)}
                    >
                      Détails
                    </button>
                    <button 
                      style={{ ...styles.button, ...styles.deleteButton }}
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
      )}

      {showModal && selectedAmbulancier && (
        <div style={styles.modal}>
          <style>{styles.modalAnimation}</style>
          <div style={{
            ...styles.modalContent,
            animation: "modalFadeIn 0.3s ease-out"
          }}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Détails de l'ambulancier</h3>
              <button 
                style={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Nom complet:</div>
              <div style={styles.detailValue}>{selectedAmbulancier.nom} {selectedAmbulancier.prenom}</div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Sexe:</div>
              <div style={styles.detailValue}>{selectedAmbulancier.sexe || "Non renseigné"}</div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Date de naissance:</div>
              <div style={styles.detailValue}>{formatDate(selectedAmbulancier.dateNaissance)}</div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Téléphone:</div>
              <div style={styles.detailValue}>{selectedAmbulancier.telephone}</div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Email:</div>
              <div style={styles.detailValue}>{selectedAmbulancier.email}</div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Adresse:</div>
              <div style={styles.detailValue}>{selectedAmbulancier.adresse || "Non renseignée"}</div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Matricule:</div>
              <div style={styles.detailValue}>{selectedAmbulancier.matricule}</div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Années d'expérience:</div>
              <div style={styles.detailValue}>{selectedAmbulancier.anneesExperience}</div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Services:</div>
              <div style={styles.detailValue}>
                {selectedAmbulancier.services && selectedAmbulancier.services.length > 0 
                  ? selectedAmbulancier.services.join(", ") 
                  : "Aucun service spécifié"}
              </div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Certifications:</div>
              <div style={styles.detailValue}>
                {selectedAmbulancier.certifications && selectedAmbulancier.certifications.length > 0 
                  ? selectedAmbulancier.certifications.join(", ") 
                  : "Aucune certification"}
              </div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Statut:</div>
              <div style={styles.detailValue}>
                <span style={{
                  ...styles.badge,
                  ...(selectedAmbulancier.statut === 'actif' ? styles.active : styles.inactive)
                }}>
                  {selectedAmbulancier.statut}
                </span>
              </div>
            </div>
            
            {selectedAmbulancier.permis && (
              <>
                <h4 style={{ margin: "15px 0 10px 0", color: "#1e3a8a" }}>Permis de conduire</h4>
                <div style={styles.detailRow}>
                  <div style={styles.detailLabel}>Numéro:</div>
                  <div style={styles.detailValue}>{selectedAmbulancier.permis.numero || "Non renseigné"}</div>
                </div>
                <div style={styles.detailRow}>
                  <div style={styles.detailLabel}>Catégorie:</div>
                  <div style={styles.detailValue}>{selectedAmbulancier.permis.categorie || "Non renseignée"}</div>
                </div>
                <div style={styles.detailRow}>
                  <div style={styles.detailLabel}>Date de délivrance:</div>
                  <div style={styles.detailValue}>{formatDate(selectedAmbulancier.permis.dateDelivrance)}</div>
                </div>
                <div style={styles.detailRow}>
                  <div style={styles.detailLabel}>Date d'expiration:</div>
                  <div style={styles.detailValue}>{formatDate(selectedAmbulancier.permis.dateExpiration)}</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}