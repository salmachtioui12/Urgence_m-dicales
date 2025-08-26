// Import des hooks React et du composant Navigate pour redirection
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

// Composant fonctionnel ProtectedRoute
// Permet de protéger une route et de rediriger vers /login si l'utilisateur n'est pas authentifié
export default function ProtectedRoute({ children }) {
  // Récupère le token dans le localStorage pour savoir si l'utilisateur est connecté
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Fonction appelée lorsque le localStorage change (ex: déconnexion depuis un autre onglet)
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token')); // Met à jour le state token
    };

    // Ajoute un écouteur sur l'événement 'storage'
    window.addEventListener('storage', handleStorageChange);

    // Nettoyage de l'écouteur au démontage du composant
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Si pas de token, redirige vers la page de login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Sinon, affiche le contenu enfant (la route protégée)
  return children;
}
