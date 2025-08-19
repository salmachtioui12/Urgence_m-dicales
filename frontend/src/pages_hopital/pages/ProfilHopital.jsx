import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ProfilHopital.css";


export default function ProfilHopital() {
  const [hopital, setHopital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const token = localStorage.getItem("token");
  let email = null;
  const navigate = useNavigate();
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      email = payload.email;
    } catch {
      email = null;
    }
  }
const handleUnauthorized = () => {
  localStorage.removeItem('token'); // On supprime le token
  navigate('/login');              // Redirection vers la page login
};

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/hopitaux/profil/by-email/${email}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHopital(response.data);
      } catch (err) {
        console.error(err);
      if (err.response?.status === 403) {
    handleUnauthorized();
  } else {
    setError('Erreur lors du chargement des données');
  }
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchProfil();
    } else {
      setLoading(false);
      setError("Email utilisateur introuvable.");
    }
  }, [email, token]);

  if (loading) return <div className="loading">Chargement en cours...</div>;
  if (error) return <div className="error">{error}</div>;
  
  const handleUpdate = () => {
    navigate("/hopital/modification");
  };

  return (
    <div className="profil-container">
      <div className="profil-header">
        <h1>Profil de l'Hôpital</h1>
        <button onClick={handleUpdate} className="update-button">
          Modifier le profil
        </button>
        {hopital?.medias?.logo && (
          <img src={hopital.medias.logo} alt="Logo" className="logo" />
        )}
      </div>

      <div className="profil-stack">
        {/* Section Informations générales */}
        <div className="profil-card">
          <h2>Informations générales</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Nom :</span>
              <span className="value">{hopital?.nom || "Non renseigné"}</span>
            </div>
            <div className="info-item">
              <span className="label">Adresse :</span>
              <span className="value">{hopital?.adresse || "Non renseigné"}</span>
            </div>
            <div className="info-item">
              <span className="label">Région :</span>
              <span className="value">{hopital?.region || "Non renseigné"}</span>
            </div>
            <div className="info-item">
              <span className="label">Profil vérifié :</span>
              <span className="value">{hopital?.profilVerifie ? "✓" : "✗"}</span>
            </div>
          </div>
        </div>

        {/* Section Contact */}
        <div className="profil-card">
          <h2>Contact</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Email :</span>
              <span className="value">{hopital?.contact?.email || "Non renseigné"}</span>
            </div>
            <div className="info-item">
              <span className="label">Téléphone Urgence :</span>
              <span className="value">{hopital?.contact?.telephoneUrgence || "Non renseigné"}</span>
            </div>
            <div className="info-item">
              <span className="label">Téléphone Secondaire :</span>
              <span className="value">{hopital?.contact?.telephoneSecondaire || "Non renseigné"}</span>
            </div>
            <div className="info-item">
              <span className="label">Site Web :</span>
              <span className="value">{hopital?.contact?.siteWeb || "Non renseigné"}</span>
            </div>
          </div>
        </div>

        {/* Section Capacités */}
        <div className="profil-card">
          <h2>Capacités</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Lits :</span>
              <span className="value">{hopital?.capacites?.lits || "-"}</span>
            </div>
            <div className="info-item">
              <span className="label">Salles d'opération :</span>
              <span className="value">{hopital?.capacites?.sallesOperation || "-"}</span>
            </div>
            <div className="info-item">
              <span className="label">Ambulances :</span>
              <span className="value">{hopital?.capacites?.ambulances || "-"}</span>
            </div>
            <div className="info-item">
              <span className="label">Urgence disponible :</span>
              <span className="value">{hopital?.capacites?.urgenceDisponible ? "Oui" : "Non"}</span>
            </div>
          </div>
        </div>

        {/* Section Responsable */}
        <div className="profil-card">
          <h2>Responsable</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Nom :</span>
              <span className="value">{hopital?.responsable?.nom || "Non renseigné"}</span>
            </div>
            <div className="info-item">
              <span className="label">Contact :</span>
              <span className="value">{hopital?.responsable?.contact || "Non renseigné"}</span>
            </div>
          </div>
        </div>

        {/* Section Ambulances */}
        <div className="profil-card">
          <h2>Ambulances ({hopital?.ambulances?.length || 0})</h2>
          {hopital?.ambulances?.length > 0 ? (
            <div className="items-list">
              {hopital.ambulances.map((amb, idx) => (
                <div key={idx} className="item">
                  <span>ID: {amb.id} - Type: {amb.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Aucune ambulance enregistrée</p>
          )}
        </div>

        {/* Section Image de couverture */}
        {hopital?.medias?.imageCouverture && (
          <div className="profil-card">
            <h2>Image de couverture</h2>
            <img 
              src={hopital.medias.imageCouverture} 
              alt="Couverture" 
              className="cover" 
            />
          </div>
        )}
      </div>
    </div>
  );
}