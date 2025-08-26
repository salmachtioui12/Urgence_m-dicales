// Import de React
import React from 'react';
// Import du hook useNavigate de react-router-dom pour naviguer programatiquement
import { useNavigate } from 'react-router-dom';

// Composant fonctionnel pour le bouton de déconnexion
export default function LogoutButton() {
  // Création de la fonction navigate pour rediriger l'utilisateur
  const navigate = useNavigate();

  // Fonction qui sera appelée lors du clic sur le bouton
  const handleLogout = () => {
    // Suppression du token stocké dans le localStorage pour déconnecter l'utilisateur
    localStorage.removeItem('token');
    // Redirection vers la page de login
    navigate('/login');
  };

  // Rendu du bouton avec l'événement onClick lié à handleLogout
  return <button onClick={handleLogout}>Se déconnecter</button>;
}
