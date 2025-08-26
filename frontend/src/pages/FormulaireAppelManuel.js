import React, { useState } from "react";

// Composant pour créer un nouvel appel d'urgence manuellement
function FormulaireAppelManuel({ onSubmit, onClose }) {
  // État local pour stocker les valeurs du formulaire
  const [formData, setFormData] = useState({
    patientName: "",
    description: "",
    localisation: "",
    gravite: "faible", // valeur par défaut
    lat: "",
    lng: "",
  });

  // Fonction pour mettre à jour l'état lors de la saisie d'un champ
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fonction appelée lors de la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();

    // Vérification des champs obligatoires
    const { patientName, description, lat, lng } = formData;
    if (patientName && description && lat && lng && !isNaN(lat) && !isNaN(lng)) {
      onSubmit(formData); // Envoie les données au parent via la prop onSubmit
    } else {
      alert("Veuillez remplir tous les champs obligatoires.");
    }
  };

  return (
    <div className="modal-overlay">
      {/* Conteneur de la fenêtre modale */}
      <div className="modal-container">
        {/* En-tête de la modale */}
        <div className="modal-header">
          <h2>➕ Nouvel Appel d'Urgence</h2>
          <button onClick={onClose} className="close-button">
            &times; {/* Bouton de fermeture */}
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Champs texte dynamiques générés par un .map */}
          {[
            { label: "👤 Nom du patient", name: "patientName", type: "text", required: true },
            { label: "📝 Description", name: "description", type: "text", required: true },
            { label: "📍 Localisation", name: "localisation", type: "text", required: false },
          ].map(({ label, name, type, required }) => (
            <div key={name} className="form-group">
              <label className="form-label">{label}</label>
              <input
                type={type}
                name={name}
                required={required}
                value={formData[name]}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">🌍 Coordonnées</label>
            <div className="coordinates-container">
              <div className="coordinate-input">
                <input
                  type="number"
                  name="lat"
                  placeholder="Latitude"
                  value={formData.lat}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="coordinate-spacer" />
              <div className="coordinate-input">
                <input
                  type="number"
                  name="lng"
                  placeholder="Longitude"
                  value={formData.lng}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">🔥 Niveau de Gravité</label>
            <select
              name="gravite"
              value={formData.gravite}
              onChange={handleChange}
              className="form-select"
            >
              <option value="faible">Faible</option>
              <option value="moyenne">Moyenne</option>
              <option value="critique">Critique</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              Enregistrer
            </button>
            <button type="button" onClick={onClose} className="cancel-button">
              Annuler
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
          padding: 2rem 0;
        }

        .modal-container {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          animation: fadeIn 0.3s ease-out;
          margin: auto;
          max-height: 90vh;
          overflow-y: auto;
          margin-bottom: 10rem; /* Espace ajouté en bas */
        }

        .coordinates-container {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .coordinate-input {
          flex: 1;
        }

        .coordinate-spacer {
          width: 1rem; /* Espace entre les champs */
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eaeaea;
        }

        .modal-header h2 {
          color: #2d3748;
          font-size: 1.5rem;
          margin: 0;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #718096;
          transition: color 0.2s;
        }

        .close-button:hover {
          color: #e53e3e;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #4a5568;
          font-size: 0.875rem;
        }

        .form-input, .form-select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.875rem;
          transition: all 0.2s;
          background-color: #f8fafc;
        }

        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
          background-color: white;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .submit-button, .cancel-button {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .submit-button {
          background-color: #3182ce;
          color: white;
        }

        .submit-button:hover {
          background-color: #2c5282;
        }

        .cancel-button {
          background-color: #e2e8f0;
          color: #4a5568;
        }

        .cancel-button:hover {
          background-color: #cbd5e0;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default FormulaireAppelManuel;