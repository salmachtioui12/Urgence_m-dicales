import React, { useState } from "react";
import Notification from "./Notification"; // Import du composant Notification

// Composant NotificationManager
// -> rôle : stocker et afficher une liste de notifications
const NotificationManager = () => {
  // État pour stocker toutes les notifications (tableau d’objets)
  const [notifications, setNotifications] = useState([]);

  // Fonction pour ajouter une nouvelle notification
  // message : texte de la notification
  // type : "success" | "error" | "warning" | "info" (par défaut "info")
  const addNotification = (message, type = "info") => {
    const id = Date.now(); // ID unique basé sur l'heure
    // On ajoute la nouvelle notification au tableau existant
    setNotifications((prev) => [...prev, { id, message, type }]);
  };

  // Fonction pour supprimer une notification spécifique (grâce à son id)
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    // Conteneur principal des notifications
    <div className="notifications-container">
      {/* On affiche chaque notification présente dans l’état */}
      {notifications.map((notification) => (
        <Notification
          key={notification.id} // clé unique pour React
          message={notification.message} // message à afficher
          type={notification.type} // type (success, error…)
          onClose={() => removeNotification(notification.id)} // fermeture
        />
      ))}
    </div>
  );
};

export default NotificationManager;
