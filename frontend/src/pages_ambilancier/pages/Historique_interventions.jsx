import React, { useEffect, useState } from "react"; // Import des hooks React
import axios from "axios"; // Pour effectuer les requêtes HTTP
import { jwtDecode } from "jwt-decode"; // Pour décoder le JWT stocké
import { useNavigate } from 'react-router-dom'; // Pour naviguer entre les pages

// Composant principal qui affiche les interventions de l'ambulancier
export default function MesInterventions() {
  const [interventions, setInterventions] = useState([]); // Stocke la liste des interventions
  const [loading, setLoading] = useState(true);           // Indique si les données sont en cours de chargement
  const [erreur, setErreur] = useState("");              // Stocke les messages d'erreur
  const navigate = useNavigate();                         // Hook pour naviguer programmétiquement

  const token = localStorage.getItem("token");           // Récupère le token JWT dans le localStorage

  // Fonction appelée si l'utilisateur n'est pas autorisé (token invalide ou expiré)
  const handleUnauthorized = () => {
    localStorage.removeItem('token'); // Supprime le token
    navigate('/login');               // Redirige vers la page de login
  };

  // -------- useEffect pour charger les interventions au montage du composant --------
  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        // Si aucun token, l'utilisateur n'est pas authentifié
        if (!token) {
          setErreur("Utilisateur non authentifié");
          return;
        }

        // Décodage du JWT pour récupérer l'ID de l'ambulancier
        const decoded = jwtDecode(token);
        const ambulancierId = decoded.id;

        // Requête HTTP GET pour récupérer les interventions de l'ambulancier
        const response = await axios.get(
          `http://localhost:3000/interventions/mes-interventions`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Envoie le token dans les headers
            },
          }
        );

        // On stocke la liste des interventions dans le state
        setInterventions(response.data);
      } catch (err) {
        // Si la réponse du serveur est 403 (non autorisé), on redirige vers login
        if (err.response?.status === 403) {
          handleUnauthorized();
        } else {
          // Autres erreurs
          setErreur("Erreur lors du chargement des interventions.");
        }

        console.error(err); // Log pour débogage
      } finally {
        setLoading(false); // Fin du chargement, succès ou erreur
      }
    };

    fetchInterventions(); // Appel de la fonction fetch
  }, [token]); // Dépendance sur le token (recharge si le token change)


  // Styles CSS
  const styles = `
    .interventions-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
    
    .interventions-container h2 {
      color: #2c3e50;
      margin-bottom: 30px;
      font-weight: 500;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    
    .loading {
      text-align: center;
      color: #666;
      margin-top: 50px;
    }
    
    .error-message {
      text-align: center;
      color: #d32f2f;
      margin-top: 50px;
      padding: 15px;
      background-color: #fde0e0;
      border-radius: 4px;
    }
    
    .no-interventions {
      text-align: center;
      color: #666;
      margin-top: 30px;
    }
    
    .interventions-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .intervention-card {
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      overflow: hidden;
      background: white;
      transition: box-shadow 0.3s ease;
    }
    
    .intervention-card:hover {
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background-color: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .card-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }
    
    .gravity-badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;
    }
    
    .gravity-badge.faible {
      background-color: #fff3e0;
      color: #e65100;
    }
    
    .gravity-badge.moyenne {
      background-color: #fff8e1;
      color: #ff8f00;
    }
    
    .gravity-badge.critique {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .card-content {
      padding: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 15px;
    }
    
    .info-group {
      margin-bottom: 5px;
    }
    
    .info-group label {
      display: block;
      font-size: 13px;
      color: #666;
      margin-bottom: 3px;
    }
    
    .info-group p {
      margin: 0;
      font-size: 14px;
      color: #333;
    }
    
    .info-group .status {
      font-weight: 500;
    }
    
    .intervention-card.en-cours .status {
      color: #1976d2;
    }
    
    .intervention-card.terminée .status {
      color: #388e3c;
    }
    
    .intervention-card.en-cours .card-header {
      border-left: 4px solid #1976d2;
    }
    
    .intervention-card.terminée .card-header {
      border-left: 4px solid #388e3c;
    }
  `;

  if (loading) return <div className="loading">Chargement en cours...</div>;
  if (erreur) return <div className="error-message">{erreur}</div>;

  return (
    <>
      <style>{styles}</style>
      <div className="interventions-container">
        <h2>Mes Interventions</h2>
        
        {interventions.length === 0 ? (
          <p className="no-interventions">Aucune intervention trouvée.</p>
        ) : (
          <div className="interventions-list">
            {interventions.map((intervention) => (
              <div 
                key={intervention._id} 
                className={`intervention-card ${intervention.statut.replace(' ', '-')}`}
              >
                <div className="card-header">
                  <h3>Intervention pour {intervention.patientName}</h3>
                  <span className={`gravity-badge ${intervention.gravite}`}>
                    {intervention.gravite}
                  </span>
                </div>
                
                <div className="card-content">
                  <div className="info-group">
                    <label>Localisation:</label>
                    <p>{intervention.localisation || "Non spécifiée"}</p>
                  </div>
                  
                  <div className="info-group">
                    <label>Statut:</label>
                    <p className="status">{intervention.statut}</p>
                  </div>
                  
                  <div className="info-group">
                    <label>Début:</label>
                    <p>{new Date(intervention.debutIntervention).toLocaleString()}</p>
                  </div>
                  
                  <div className="info-group">
                    <label>Fin estimée:</label>
                    <p>{intervention.finEstimee 
                        ? new Date(intervention.finEstimee).toLocaleString() 
                        : "Non estimée"}</p>
                  </div>
                  
                  {intervention.finIntervention && (
                    <div className="info-group">
                      <label>Fin réelle:</label>
                      <p>{new Date(intervention.finIntervention).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}