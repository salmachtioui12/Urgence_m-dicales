import React, { useEffect, useState } from "react";
import axios from "axios";

export default function UserManagement() {
  // États
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({});

  const token = localStorage.getItem("token");

  // Effets
  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  // Fonctions
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/users/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:3000/users/users/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Erreur récupération stats:", err);
    }
  };

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
    showConfirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?", async () => {
      try {
        await axios.delete(`http://localhost:3000/users/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.filter(user => user._id !== id));
      } catch (err) {
        console.error(err);
        setError("Erreur lors de la suppression");
      }
    });
  };

  const handleShowDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // Styles
  const styles = {
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
    statsContainer: {
      margin: "20px 0",
      padding: "15px",
      backgroundColor: "#f8fafc",
      borderRadius: "8px"
    },
    statsTitle: {
      margin: "0 0 10px 0",
      color: "#1e3a8a"
    },
    noUsers: {
      textAlign: "center",
      padding: "40px",
      backgroundColor: "white",
      borderRadius: "0 0 8px 8px",
      color: "#666",
      fontSize: "16px"
    },
    cardContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "20px",
      marginTop: "20px"
    },
    card: {
      backgroundColor: "white",
      borderRadius: "10px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      ":hover": {
        transform: "translateY(-5px)",
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)"
      }
    },
    cardHeader: {
      padding: "15px",
      borderBottom: "1px solid #e2e8f0",
      backgroundColor: "#f8fafc"
    },
    cardTitle: {
      margin: "0",
      fontSize: "18px",
      fontWeight: "600",
      color: "#1e3a8a"
    },
    cardBody: {
      padding: "15px"
    },
    cardField: {
      marginBottom: "10px",
      display: "flex",
      alignItems: "center"
    },
    cardLabel: {
      fontWeight: "600",
      minWidth: "80px",
      color: "#475569",
      fontSize: "14px"
    },
    cardValue: {
      flex: "1",
      color: "#334155",
      fontSize: "14px"
    },
    cardFooter: {
      padding: "15px",
      borderTop: "1px solid #e2e8f0",
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px"
    },
    badge: {
      padding: "4px 8px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "600"
    },
    adminRole: {
      backgroundColor: "#dcfce7",
      color: "#166534"
    },
    hopitalRole: {
      backgroundColor: "#dbeafe",
      color: "#1e40af"
    },
    ambulancierRole: {
      backgroundColor: "#fef9c3",
      color: "#854d0e"
    },
    activeStatus: {
      backgroundColor: "#dcfce7",
      color: "#166534"
    },
    inactiveStatus: {
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
    statsContainer: {
  margin: "20px 0",
  padding: "20px",
  backgroundColor: "white",
  borderRadius: "10px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px"
},
statsCard: {
  padding: "15px",
  borderRadius: "8px",
  backgroundColor: "#f8fafc",
  textAlign: "center",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
},
statsValue: {
  fontSize: "28px",
  fontWeight: "700",
  margin: "10px 0",
  color: "#1e3a8a"
},
statsLabel: {
  fontSize: "14px",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "1px"
},
statusItem: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 0",
  borderBottom: "1px solid #e2e8f0",
  ":last-child": {
    borderBottom: "none"
  }
},
statusLabel: {
  color: "#475569",
  fontSize: "14px"
},
statusValue: {
  fontWeight: "600",
  color: "#334155"
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

  // Animations CSS
  const animations = {
    spinner: `@keyframes spin { to { transform: translate(-50%, -50%) rotate(360deg); } }`,
    modalFadeIn: `@keyframes modalFadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }`
  };

  // Affichage des états de chargement et d'erreur
  if (loading) return (
    <>
      <style>{animations.spinner}</style>
      <div style={styles.loadingSpinner}></div>
    </>
  );
  
  if (error) return <div style={styles.errorMessage}>{error}</div>;

  // Rendu principal
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

      {/* En-tête */}
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Gestion des Utilisateurs</h2>
      </div>

      {/* Statistiques */}
    
{stats && (
  <div style={styles.statsContainer}>
    <div style={styles.statsCard}>
      <div style={styles.statsLabel}>Total Utilisateurs</div>
      <div style={styles.statsValue}>{stats.totalUsers}</div>
    </div>
    <div style={styles.statsCard}>
      <div style={styles.statsLabel}>Hôpitaux</div>
      <div style={styles.statsValue}>{stats.totalHopitaux}</div>
    </div>
    <div style={styles.statsCard}>
      <div style={styles.statsLabel}>Ambulanciers</div>
      <div style={styles.statsValue}>{stats.totalAmbulanciers}</div>
    </div>
    <div style={{ ...styles.statsCard, gridColumn: "1 / -1" }}>
      <div style={styles.statsLabel}>Statuts</div>
      <div style={{ marginTop: "15px" }}>
        <div style={styles.statusItem}>
          <span style={styles.statusLabel}>En attente</span>
          <span style={styles.statusValue}>{stats.statusCounts.en_attente}</span>
        </div>
        <div style={styles.statusItem}>
          <span style={styles.statusLabel}>Approuvé</span>
          <span style={styles.statusValue}>{stats.statusCounts.approuve}</span>
        </div>
        <div style={styles.statusItem}>
          <span style={styles.statusLabel}>Rejeté</span>
          <span style={styles.statusValue}>{stats.statusCounts.rejete}</span>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Liste des utilisateurs sous forme de cartes */}
      {users.length === 0 ? (
        <div style={styles.noUsers}>
          <p>Aucun utilisateur enregistré.</p>
        </div>
      ) : (
        <div style={styles.cardContainer}>
          {users.map((user) => (
            <div key={user._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{user.nom}</h3>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.cardField}>
                  <span style={styles.cardLabel}>Email:</span>
                  <span style={styles.cardValue}>{user.email}</span>
                </div>
                <div style={styles.cardField}>
                  <span style={styles.cardLabel}>Rôle:</span>
                  <span style={styles.cardValue}>
                    <span style={{
                      ...styles.badge,
                      ...(user.role === 'admin' ? styles.adminRole : 
                          user.role === 'hopital' ? styles.hopitalRole : styles.ambulancierRole)
                    }}>
                      {user.role}
                    </span>
                  </span>
                </div>
                <div style={styles.cardField}>
                  <span style={styles.cardLabel}>Statut:</span>
                  <span style={styles.cardValue}>
                    <span style={{
                      ...styles.badge,
                      ...(user.status === 'actif' ? styles.activeStatus : styles.inactiveStatus)
                    }}>
                      {user.status}
                    </span>
                  </span>
                </div>
              </div>
              <div style={styles.cardFooter}>
                <button 
                  style={{ ...styles.button, ...styles.detailButton }}
                  onClick={() => handleShowDetails(user)}
                >
                  Détails
                </button>
                <button 
                  style={{ ...styles.button, ...styles.deleteButton }}
                  onClick={() => handleDelete(user._id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de détails */}
      {showModal && selectedUser && (
        <div style={styles.modal}>
          <style>{animations.modalFadeIn}</style>
          <div style={{
            ...styles.modalContent,
            animation: "modalFadeIn 0.3s ease-out"
          }}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Détails de l'utilisateur</h3>
              <button 
                style={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
            
            {/* Informations de base */}
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Nom:</div>
              <div style={styles.detailValue}>{selectedUser.nom}</div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Email:</div>
              <div style={styles.detailValue}>{selectedUser.email}</div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Rôle:</div>
              <div style={styles.detailValue}>
                <span style={{
                  ...styles.badge,
                  ...(selectedUser.role === 'admin' ? styles.adminRole : 
                      selectedUser.role === 'hopital' ? styles.hopitalRole : styles.ambulancierRole)
                }}>
                  {selectedUser.role}
                </span>
              </div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Statut:</div>
              <div style={styles.detailValue}>
                <span style={{
                  ...styles.badge,
                  ...(selectedUser.status === 'actif' ? styles.activeStatus : styles.inactiveStatus)
                }}>
                  {selectedUser.status}
                </span>
              </div>
            </div>

            {/* Informations spécifiques au rôle */}
            {selectedUser.role === "hopital" && (
              <>
                <h4 style={{ margin: "15px 0 10px 0", color: "#1e3a8a" }}>Informations Hôpital</h4>
                <div style={styles.detailRow}>
                  <div style={styles.detailLabel}>Nom de l'hôpital:</div>
                  <div style={styles.detailValue}>{selectedUser.nomHopital || "Non renseigné"}</div>
                </div>
                <div style={styles.detailRow}>
                  <div style={styles.detailLabel}>Adresse:</div>
                  <div style={styles.detailValue}>{selectedUser.adresse || "Non renseignée"}</div>
                </div>
              </>
            )}

            {selectedUser.role === "ambulancier" && (
              <>
                <h4 style={{ margin: "15px 0 10px 0", color: "#1e3a8a" }}>Informations Ambulancier</h4>
                <div style={styles.detailRow}>
                  <div style={styles.detailLabel}>Matricule:</div>
                  <div style={styles.detailValue}>{selectedUser.matricule || "Non renseigné"}</div>
                </div>
                <div style={styles.detailRow}>
                  <div style={styles.detailLabel}>Services:</div>
                  <div style={styles.detailValue}>
                    {selectedUser.services && selectedUser.services.length > 0 
                      ? selectedUser.services.join(", ") 
                      : "Aucun service spécifié"}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}