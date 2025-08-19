import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function ProfilAmbulancier() {
  const [ambulancier, setAmbulancier] = useState(null);
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

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/ambulanciers/profil/${email}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAmbulancier(response.data);
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
    navigate("/ambulancier/modifier");
  };
const handleUnauthorized = () => {
  localStorage.removeItem('token'); // On supprime le token
  navigate('/login');              // Redirection vers la page login
};

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "Non renseigné";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="profil-container">
      <div className="profil-header">
        <h1>Profil de l'Ambulancier</h1>
        <button onClick={handleUpdate} className="update-button">
          Modifier le profil
        </button>
      </div>

      <div className="profil-stack">
        {/* Section Informations personnelles */}
        <div className="profil-card">
          <h2>Informations personnelles</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Nom :</span>
              <span className="value">{ambulancier?.nom || "Non renseigné"}</span>
            </div>
            <div className="info-item">
              <span className="label">Prénom :</span>
              <span className="value">{ambulancier?.prenom || "Non renseigné"}</span>
            </div>
            <div className="info-item">
              <span className="label">Sexe :</span>
              <span className="value">
                {ambulancier?.sexe === 'M' ? 'Masculin' : 
                 ambulancier?.sexe === 'F' ? 'Féminin' : 
                 ambulancier?.sexe || "Non renseigné"}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Date de naissance :</span>
              <span className="value">{formatDate(ambulancier?.dateNaissance)}</span>
            </div>
            <div className="info-item">
              <span className="label">Téléphone :</span>
              <span className="value">{ambulancier?.telephone || "Non renseigné"}</span>
            </div>
            <div className="info-item">
              <span className="label">Email :</span>
              <span className="value">{ambulancier?.email}</span>
            </div>
            <div className="info-item">
              <span className="label">Adresse :</span>
              <span className="value">{ambulancier?.adresse || "Non renseigné"}</span>
            </div>
          </div>
        </div>

        {/* Section Informations professionnelles */}
        <div className="profil-card">
          <h2>Informations professionnelles</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Matricule :</span>
              <span className="value">{ambulancier?.matricule || "Non renseigné"}</span>
            </div>
            <div className="info-item">
              <span className="label">ID Hôpital affilié :</span>
              <span className="value">{ambulancier?.hopitalId || "Non renseigné"}</span>
            </div>
            <div className="info-item">
              <span className="label">Années d'expérience :</span>
              <span className="value">{ambulancier?.anneesExperience || "0"}</span>
            </div>
            <div className="info-item">
              <span className="label">Statut :</span>
              <span className={`value status-${ambulancier?.statut}`}>
                {ambulancier?.statut === 'disponible' ? 'Disponible' :
                 ambulancier?.statut === 'en-mission' ? 'En mission' :
                 ambulancier?.statut === 'indisponible' ? 'Indisponible' : 
                 'Non renseigné'}
              </span>
            </div>
          </div>
        </div>

        {/* Section Permis de conduire */}
        <div className="profil-card">
          <h2>Permis de conduire</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Numéro :</span>
              <span className="value">{ambulancier?.permis?.numero || "Non renseigné"}</span>
            </div>
            <div className="info-item">
              <span className="label">Catégorie :</span>
              <span className="value">{ambulancier?.permis?.categorie || "Non renseigné"}</span>
            </div>
            <div className="info-item">
              <span className="label">Date de délivrance :</span>
              <span className="value">{formatDate(ambulancier?.permis?.dateDelivrance)}</span>
            </div>
            <div className="info-item">
              <span className="label">Date d'expiration :</span>
              <span className="value">{formatDate(ambulancier?.permis?.dateExpiration)}</span>
            </div>
          </div>
        </div>

        {/* Section Services */}
        <div className="profil-card">
          <h2>Services ({ambulancier?.services?.length || 0})</h2>
          {ambulancier?.services?.length > 0 ? (
            <div className="items-list">
              {ambulancier.services.map((service, idx) => (
                <div key={idx} className="item">
                  <span>{service}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Aucun service enregistré</p>
          )}
        </div>

        {/* Section Certifications */}
        <div className="profil-card">
          <h2>Certifications ({ambulancier?.certifications?.length || 0})</h2>
          {ambulancier?.certifications?.length > 0 ? (
            <div className="items-list">
              {ambulancier.certifications.map((certification, idx) => (
                <div key={idx} className="item">
                  <span>{certification}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Aucune certification enregistrée</p>
          )}
        </div>
      </div>
    </div>
  );
}