import React, { useEffect, useState, useRef } from "react";
import LineChartAppels from "../components/LineChartAppels"; // Composant pour afficher le graphique des appels

export default function Statistiques() {
  // -------- États principaux --------
  const [appelsParHeure, setAppelsParHeure] = useState([]); // Stocke les appels regroupés par heure
  const [loading, setLoading] = useState(true);             // Indique si les données sont en cours de chargement
  const [lastUpdate, setLastUpdate] = useState(null);       // Date et heure de la dernière mise à jour
  const wsRef = useRef(null);                               // Référence pour le WebSocket

  // -------- Effet au montage du composant --------
  useEffect(() => {
    // Création du WebSocket
    wsRef.current = new WebSocket("ws://localhost:3000");

    // Lorsque la connexion est ouverte
    wsRef.current.onopen = () => {
      console.log("✅ WebSocket connecté Statistiques");
      setLoading(true); // On est en mode chargement
      wsRef.current.send(JSON.stringify({ action: "getAppelsParHeure" })); // Demande des données
    };

    // Réception de messages depuis le serveur
    wsRef.current.onmessage = (message) => {
      try {
        const parsed = JSON.parse(message.data);
        // Vérifie si c'est une mise à jour des appels par heure
        if (parsed.type === "APPELS_PAR_HEURE_UPDATE") {
          setAppelsParHeure(parsed.data); // Met à jour les données
          setLoading(false);               // Fin du chargement
          setLastUpdate(new Date());       // Met à jour l'heure de la dernière mise à jour
        }
      } catch (err) {
        console.error("Erreur parsing WebSocket message", err);
      }
    };

    // Gestion des erreurs WebSocket
    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Lors de la fermeture de la connexion
    wsRef.current.onclose = () => {
      console.log("❌ WebSocket déconnecté Statistiques");
    };

    // Cleanup : fermeture du WebSocket lors du démontage
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []); // [] : s'exécute une seule fois au montage

  // -------- Affichage en cas de chargement --------
  if (loading) {
    return (
      <div
        style={{
          fontSize: "1.8rem",
          color: "#999",
          textAlign: "center",
          marginTop: 60,
          fontWeight: "600",
          fontStyle: "italic",
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        Chargement des statistiques...
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "50px auto",
        padding: 40,
        backgroundColor: "#f0f4f8",
        borderRadius: 16,
        boxShadow: "0 16px 32px rgba(0,0,0,0.12)",
        fontFamily: "'Montserrat', sans-serif",
        color: "#222",
        userSelect: "none",
        display: "flex",
        gap: 40,
      }}
    >
      {/* Graphique à gauche */}
      <div style={{ flex: 1 }}>
        <h1
          style={{
            fontSize: "2.8rem",
            marginBottom: 24,
            fontWeight: "900",
            color: "#1e88e5",
            letterSpacing: "2px",
            textTransform: "uppercase",
            textShadow: "0 1px 4px rgba(30,136,229,0.5)",
            textAlign: "center",
          }}
        >
          Statistiques des Urgences
        </h1>
        <LineChartAppels data={appelsParHeure} />
        <p
          style={{
            marginTop: 20,
            fontSize: "1.3rem",
            fontWeight: "700",
            textAlign: "center",
            color: "#1e88e5",
          }}
        >
          Total appels aujourd'hui :{" "}
          <span style={{ color: "#004c8c" }}>
            {appelsParHeure.reduce((sum, item) => sum + item.total, 0)}
          </span>
        </p>
        <p
          style={{
            fontSize: "1rem",
            color: "#666",
            textAlign: "center",
            marginTop: 8,
            fontStyle: "italic",
            userSelect: "text",
          }}
        >
          Dernière mise à jour : {lastUpdate ? lastUpdate.toLocaleTimeString() : "Inconnue"}
        </p>
      </div>

      {/* Liste des totaux par heure à droite */}
      <div
        style={{
          width: 220,
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          height: "fit-content",
          fontWeight: "600",
        }}
      >
        <h3 style={{ textAlign: "center", marginBottom: 16, color: "#1e88e5" }}>
          Totaux par heure
        </h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {appelsParHeure.map(({ heure, total }) => (
            <li
              key={heure}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
                borderBottom: "1px solid #ddd",
                fontSize: 16,
                color: "#333",
              }}
            >
              <span>{heure}</span>
              <span>{total}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
