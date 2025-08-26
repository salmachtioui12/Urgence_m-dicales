// Import des hooks React et du composant de graphique
import React, { useEffect, useState, useRef } from "react";
import LineChartAppels from "./LineChartAppels";

// Composant Statistiques
// Affiche un graphique des urgences par heure en temps réel via WebSocket
export default function Statistiques() {
  // State pour stocker les appels par heure
  const [appelsParHeure, setAppelsParHeure] = useState([]);
  // State pour gérer le chargement
  const [loading, setLoading] = useState(true);
  // Ref pour garder la référence du WebSocket
  const wsRef = useRef(null);

  useEffect(() => {
    // Création du WebSocket vers le serveur
    wsRef.current = new WebSocket("ws://localhost:3000");

    // Quand la connexion WebSocket est ouverte
    wsRef.current.onopen = () => {
      console.log("✅ WebSocket connecté Statistiques");
      setLoading(true);
      // On peut envoyer une requête initiale pour récupérer les données
      wsRef.current.send(JSON.stringify({ action: "getAppelsParHeure" }));
    };

    // Quand un message est reçu du serveur
    wsRef.current.onmessage = (message) => {
      try {
        const parsed = JSON.parse(message.data);
        // Vérifie si le message contient les mises à jour des appels
        if (parsed.type === "APPELS_PAR_HEURE_UPDATE") {
          setAppelsParHeure(parsed.data); // Met à jour le state avec les nouvelles données
          setLoading(false); // Fin du chargement
        }
      } catch (err) {
        console.error("Erreur parsing WebSocket message", err);
      }
    };

    // Gestion des erreurs WebSocket
    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Quand la connexion WebSocket se ferme
    wsRef.current.onclose = () => {
      console.log("❌ WebSocket déconnecté Statistiques");
    };

    // Nettoyage : fermeture du WebSocket lors du démontage du composant
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []); // Le tableau vide [] indique que ce useEffect se lance une seule fois au montage

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: 20,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Titre principal */}
      <h1
        style={{
          textAlign: "center",
          color: "#1e88e5",
          marginBottom: 20,
          textTransform: "uppercase",
        }}
      >
        Statistiques des urgences
      </h1>

      {/* Affiche un message de chargement */}
      {loading && <p style={{ textAlign: "center" }}>Chargement des statistiques...</p>}

      {/* Si aucune donnée n’est disponible */}
      {!loading && appelsParHeure.length === 0 && (
        <p style={{ textAlign: "center", color: "#999" }}>Aucune donnée disponible pour le moment.</p>
      )}

      {/* Affiche le graphique si des données sont présentes */}
      {!loading && appelsParHeure.length > 0 && (
        <div style={{ backgroundColor: "#fff", padding: 20, borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <LineChartAppels data={appelsParHeure} />
        </div>
      )}
    </div>
  );
}
