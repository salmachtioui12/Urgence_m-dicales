// Import React et hooks nécessaires, ainsi que des icônes de lucide-react
import React, { useEffect, useRef, useState } from 'react';
import { Bell, Volume2, VolumeX, X, Trash2 } from 'lucide-react';

// Composant pour gérer les notifications en temps réel via WebSocket
const WebSocketNotifications = () => {
  // State pour stocker les notifications reçues
  const [notifications, setNotifications] = useState([]);
  // State pour activer/désactiver le son des notifications
  const [audioEnabled, setAudioEnabled] = useState(true);
  // State pour afficher/masquer le panneau de notifications
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Refs pour gérer les références DOM et WebSocket
  const audioRef = useRef(null);        // Audio alert
  const wsRef = useRef(null);           // WebSocket
  const reconnectRef = useRef(null);    // Gestion de reconnexion
  const notificationRef = useRef(null); // Ref du conteneur notifications

  // Fermer les notifications si clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gestion de l'audio, récupération initiale et connexion WebSocket
  useEffect(() => {
    // Initialisation de l'audio
    audioRef.current = new Audio('/alert.mp3');

    // Récupération initiale des notifications depuis l'API
    const fetchInitialNotifications = async () => {
      try {
        const res = await fetch('http://localhost:3000/notifications');
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error("Erreur chargement initial:", err);
      }
    };

    // Fonction pour connecter le WebSocket
    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:3000');
      wsRef.current = ws;

      // Quand WebSocket est connecté
      ws.onopen = () => {
        console.log("✅ WebSocket connecté");
        // Stop toute reconnexion automatique
        if (reconnectRef.current) {
          clearInterval(reconnectRef.current);
          reconnectRef.current = null;
        }
      };

      // Quand un message est reçu
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          // Si c'est une alerte critique
          if (payload.type === 'ALERTE_CRITIQUE') {
            const newNotif = payload.data;

            // Vérifie si la notification existe déjà avant d'ajouter
            setNotifications(prev => {
              const alreadyExists = prev.some(n =>
                n._id === newNotif._id || (
                  n.patientName === newNotif.patientName &&
                  n.heureAppel === newNotif.heureAppel &&
                  n.localisation === newNotif.localisation
                )
              );
              
              if (!alreadyExists) {
                return [newNotif, ...prev]; // Ajoute la nouvelle notification en tête
              }
              return prev;
            });

            // Joue le son si activé
            if (audioEnabled && audioRef.current) {
              audioRef.current.play().catch(err =>
                console.warn("🔇 Erreur audio:", err)
              );
            }
          }
        } catch (err) {
          console.error("Erreur parsing WebSocket:", err);
        }
      };

      // Gestion de la fermeture WebSocket avec reconnexion
      ws.onclose = () => {
        console.log("🔌 WebSocket fermé, tentative de reconnexion...");
        if (!reconnectRef.current) {
          reconnectRef.current = setInterval(connectWebSocket, 3000);
        }
      };

      // Gestion des erreurs WebSocket
      ws.onerror = (err) => {
        console.error("❌ Erreur WebSocket :", err);
        ws.close();
      };
    };

    // Récupération initiale + connexion WebSocket
    fetchInitialNotifications();
    connectWebSocket();

    // Nettoyage lors du démontage du composant
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectRef.current) clearInterval(reconnectRef.current);
    };
  }, [audioEnabled]);

  // Supprimer une notification spécifique
  const removeNotification = async (id, indexToRemove) => {
    try {
      await fetch(`http://localhost:3000/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter((_, i) => i !== indexToRemove));
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
    }
  };

  // Supprimer toutes les notifications
  const clearAllNotifications = async () => {
    try {
      await fetch('http://localhost:3000/notifications', { method: 'DELETE' });
      setNotifications([]);
    } catch (err) {
      console.error("Erreur lors de la suppression totale:", err);
    }
  };

  // Formater l'heure pour affichage lisible
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div ref={notificationRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bouton pour afficher/masquer notifications */}
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        style={{
          background: showNotifications ? '#f0f7ff' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '10px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          position: 'relative',
        }}
      >
        <Bell size={20} color={showNotifications ? '#1e88e5' : '#2c3e50'} />
        {/* Badge du nombre de notifications */}
        {notifications.length > 0 && (
          <span style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            backgroundColor: '#f44336',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {/* Panneau des notifications */}
      {showNotifications && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '50px',
          width: '350px',
          maxHeight: '500px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          border: '1px solid #e0e0e0',
          zIndex: 1000,
        }}>
          {/* Header du panneau */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>Notifications</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              {/* Bouton activer/désactiver le son */}
              <button 
                onClick={() => setAudioEnabled(!audioEnabled)} 
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: audioEnabled ? '#1e88e5' : '#64748b',
                }}
                title={audioEnabled ? 'Désactiver le son' : 'Activer le son'}
              >
                {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>

              {/* Bouton pour tout effacer */}
              {notifications.length > 0 && (
                <button 
                  onClick={clearAllNotifications}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#64748b',
                  }}
                  title="Tout effacer"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Liste des notifications */}
          <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                Aucune notification pour le moment
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {notifications.map((notification, index) => (
                  <li 
                    key={notification._id || index}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.2s',
                      ':hover': {
                        backgroundColor: '#f8fafc'
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 500, color: '#1e293b' }}>
                        {notification.patientName || 'Patient'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {formatTime(notification.heureAppel)}
                      </div>
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '14px', color: '#475569' }}>
                      Alerte critique
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '13px', color: '#3b82f6' }}>
                      {notification.localisation || 'Localisation inconnue'}
                    </div>
                    <button
                      onClick={() => removeNotification(notification._id, index)}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        ':hover': {
                          color: '#64748b'
                        }
                      }}
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebSocketNotifications;