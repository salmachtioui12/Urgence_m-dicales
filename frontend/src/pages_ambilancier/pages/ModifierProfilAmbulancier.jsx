import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ModifierProfilAmbulancier.css";

export default function ModifierProfilAmbulancier() {
  const [profil, setProfil] = useState({
    nom: "",
    prenom: "",
    sexe: "",
    dateNaissance: "",
    telephone: "",
    email: "",
    adresse: "",
    matricule: "",
    hopitalId: "",
    anneesExperience: 0,
    services: [],
    permis: {
      numero: "",
      categorie: "",
      dateDelivrance: "",
      dateExpiration: ""
    },
    certifications: [],
    statut: "disponible"
  });

  const [newService, setNewService] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let email = null;
    const [error, setError] = useState("");
const handleUnauthorized = () => {
  localStorage.removeItem('token'); // On supprime le token
  navigate('/login');              // Redirection vers la page login
};

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
        const res = await axios.get(`http://localhost:3000/api/ambulanciers/profil/${email}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfil(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement du profil :", error);
          if (error.response?.status === 403) {
    handleUnauthorized();
  } else {
    setError('Erreur lors du chargement des données');
  }
        setLoading(false);
        setMessage({ text: "Erreur lors du chargement du profil.", type: "error" });
      }
    };
    
    if (email) {
      fetchProfil();
    } else {
      setLoading(false);
      setMessage({ text: "Email utilisateur introuvable.", type: "error" });
    }
  }, [email, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfil({ ...profil, [name]: value });
  };

  const handlePermisChange = (e) => {
    const { name, value } = e.target;
    setProfil({
      ...profil,
      permis: {
        ...profil.permis,
        [name]: value
      }
    });
  };

  const addService = () => {
    if (newService.trim()) {
      setProfil({
        ...profil,
        services: [...profil.services, newService.trim()]
      });
      setNewService("");
    }
  };

  const removeService = (index) => {
    const newServices = profil.services.filter((_, i) => i !== index);
    setProfil({ ...profil, services: newServices });
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setProfil({
        ...profil,
        certifications: [...profil.certifications, newCertification.trim()]
      });
      setNewCertification("");
    }
  };

  const removeCertification = (index) => {
    const newCertifications = profil.certifications.filter((_, i) => i !== index);
    setProfil({ ...profil, certifications: newCertifications });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`http://localhost:3000/api/ambulanciers/profil/${email}`, profil, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ text: "Profil mis à jour avec succès !", type: "success" });
      
      setTimeout(() => navigate("/ambulancier/profil"), 1500);
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      setMessage({ text: "Erreur lors de la mise à jour du profil.", type: "error" });
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
    </div>
  );

  return (<>
    <div className="modifier-profil-page">
      <div className="profil-header">
        <div className="header-content">
          <h1>Modifier le profil ambulancier</h1>
          <p>Mettez à jour vos informations personnelles et professionnelles</p>
        </div>
      </div>

      {message.text && (
        <div className={`message-alert ${message.type}`}>
          {message.type === "success" ? (
            <svg className="icon" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          ) : (
            <svg className="icon" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="profil-form">
        {/* Section Informations personnelles */}
        <div className="form-section">
          <h2>Informations personnelles</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nom">Nom *</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={profil.nom}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="prenom">Prénom *</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={profil.prenom}
                onChange={handleChange}
               
              />
            </div>

            <div className="form-group">
              <label htmlFor="sexe">Sexe</label>
              <select
                id="sexe"
                name="sexe"
                value={profil.sexe}
                onChange={handleChange}
              >
                <option value="">Sélectionner</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dateNaissance">Date de naissance</label>
              <input
                type="date"
                id="dateNaissance"
                name="dateNaissance"
                value={profil.dateNaissance?.split('T')[0] || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="telephone">Téléphone *</label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={profil.telephone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profil.email}
                onChange={handleChange}
                required
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="adresse">Adresse</label>
              <input
                type="text"
                id="adresse"
                name="adresse"
                value={profil.adresse}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Section Informations professionnelles */}
        <div className="form-section">
          <h2>Informations professionnelles</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="matricule">Matricule</label>
              <input
                type="text"
                id="matricule"
                name="matricule"
                value={profil.matricule}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="hopitalId">ID Hôpital affilié</label>
              <input
                type="text"
                id="hopitalId"
                name="hopitalId"
                value={profil.hopitalId}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="anneesExperience">Années d'expérience</label>
              <input
                type="number"
                id="anneesExperience"
                name="anneesExperience"
                value={profil.anneesExperience}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="statut">Statut</label>
              <select
                id="statut"
                name="statut"
                value={profil.statut}
                onChange={handleChange}
              >
                <option value="disponible">Disponible</option>
                <option value="en-mission">En mission</option>
                <option value="indisponible">Indisponible</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section Permis */}
        <div className="form-section">
          <h2>Permis de conduire</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="numeroPermis">Numéro de permis</label>
              <input
                type="text"
                id="numeroPermis"
                name="numero"
                value={profil.permis?.numero || ""}
                onChange={handlePermisChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="categoriePermis">Catégorie</label>
              <input
                type="text"
                id="categoriePermis"
                name="categorie"
                value={profil.permis?.categorie || ""}
                onChange={handlePermisChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateDelivrance">Date de délivrance</label>
              <input
                type="date"
                id="dateDelivrance"
                name="dateDelivrance"
                value={profil.permis?.dateDelivrance?.split('T')[0] || ""}
                onChange={handlePermisChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateExpiration">Date d'expiration</label>
              <input
                type="date"
                id="dateExpiration"
                name="dateExpiration"
                value={profil.permis?.dateExpiration?.split('T')[0] || ""}
                onChange={handlePermisChange}
              />
            </div>
          </div>
        </div>

        {/* Section Services */}
        <div className="form-section">
          <div className="section-header">
            <h2>Services proposés</h2>
            <div className="add-item-control">
              <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Nouveau service"
              />
              <button type="button" onClick={addService} className="add-button">
                +
              </button>
            </div>
          </div>

          {profil.services?.length === 0 ? (
            <div className="empty-state">
              <p>Aucun service enregistré</p>
            </div>
          ) : (
            <div className="items-list">
              {profil.services?.map((service, index) => (
                <div className="item-card" key={index}>
                  <span>{service}</span>
                  <button 
                    type="button" 
                    onClick={() => removeService(index)}
                    className="delete-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section Certifications */}
        <div className="form-section">
          <div className="section-header">
            <h2>Certifications</h2>
            <div className="add-item-control">
              <input
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                placeholder="Nouvelle certification"
              />
              <button type="button" onClick={addCertification} className="add-button">
                +
              </button>
            </div>
          </div>

          {profil.certifications?.length === 0 ? (
            <div className="empty-state">
              <p>Aucune certification enregistrée</p>
            </div>
          ) : (
            <div className="items-list">
              {profil.certifications?.map((certification, index) => (
                <div className="item-card" key={index}>
                  <span>{certification}</span>
                  <button 
                    type="button" 
                    onClick={() => removeCertification(index)}
                    className="delete-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={() => navigate("/ambulancier/profil")}>
            Annuler
          </button>
          <button type="submit" className="submit-button">
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>  <style >{` /* Ajoutez ceci à votre fichier CSS existant */
.add-item-control {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.add-item-control input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.add-item-control input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.3);
}

.add-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-button:hover {
  background-color: #3182ce;
  transform: translateY(-2px);
}

.item-card {
  display: flex;
  align-items: center;
  background-color: #edf2f7;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.item-card:hover {
  background-color: #e2e8f0;
}

.delete-btn {
  margin-left: 0.5rem;
  background: none;
  border: none;
  color: #e53e3e;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0 0.25rem;
  line-height: 1;
}

.delete-btn:hover {
  color: #c53030;
}

.empty-state {
  padding: 1rem;
  text-align: center;
  color: #718096;
  font-style: italic;
  background-color: #f8fafc;
  border-radius: 8px;
}`}</style>
  </>
);
}
