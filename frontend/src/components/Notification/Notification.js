import React, { useEffect } from "react";
import "./Notification.css"; // Fichier CSS pour le style de la notification

// Composant Notification
// Props :
// - message : le texte du message à afficher
// - type : le type de notification ("success", "error", "warning", "info")
// - onClose : fonction pour fermer la notification
const Notification = ({ message, type, onClose }) => {
  // useEffect pour fermer automatiquement la notification après 5 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // Appelle la fonction de fermeture
    }, 5000);

    // Nettoyage du timer si le composant est démonté avant les 5s
    return () => clearTimeout(timer);
  }, [onClose]);

  // Fonction qui retourne une icône selon le type de notification
  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓"; 
      case "error":
        return "✕"; 
      case "warning":
        return "!";
      default:
        return "i"; 
    }
  };

  return (
    // Container principal avec une classe dynamique selon le type
    <div className={`notification ${type}`}>
      <div className="notification-content">
        {/* Icône */}
        <div className="notification-icon">{getIcon()}</div>

        {/* Texte de la notification */}
        <div className="notification-text">
          <div className="notification-title">{type}</div>
          <div className="notification-message">{message}</div>
        </div>
      </div>

      {/* Bouton pour fermer la notification manuellement */}
      <button className="notification-close" onClick={onClose}>
        &times; {/* Symbole × */}
      </button>
    </div>
  );
};

export default Notification;
