import React, { useEffect, useRef, useState } from 'react';
import { Bell, Volume2, VolumeX, X, Trash2 } from 'lucide-react';

const WebSocketNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const audioRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const notificationRef = useRef(null);

  // Fermer les notifications quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Initialiser l'audio
    audioRef.current = new Audio('/alert.mp3');

    const fetchInitialNotifications = async () => {
      try {
        const res = await fetch('http://localhost:3000/notifications');
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error("Erreur chargement initial:", err);
      }
    };

    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:3000');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connecté");
        if (reconnectRef.current) {
          clearInterval(reconnectRef.current);
          reconnectRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'ALERTE_CRITIQUE') {
            const newNotif = payload.data;

            setNotifications(prev => {
              const alreadyExists = prev.some(n =>
                n._id === newNotif._id || (
                  n.patientName === newNotif.patientName &&
                  n.heureAppel === newNotif.heureAppel &&
                  n.localisation === newNotif.localisation
                )
              );
              
              if (!alreadyExists) {
                return [newNotif, ...prev];
              }
              return prev;
            });

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

      ws.onclose = () => {
        console.log("🔌 WebSocket fermé, tentative de reconnexion...");
        if (!reconnectRef.current) {
          reconnectRef.current = setInterval(connectWebSocket, 3000);
        }
      };

      ws.onerror = (err) => {
        console.error("❌ Erreur WebSocket :", err);
        ws.close();
      };
    };

    fetchInitialNotifications();
    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectRef.current) clearInterval(reconnectRef.current);
    };
  }, [audioEnabled]);

  const removeNotification = async (id, indexToRemove) => {
    try {
      await fetch(`http://localhost:3000/notifications/${id}`, {
        method: 'DELETE'
      });
      setNotifications(prev => prev.filter((_, i) => i !== indexToRemove));
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await fetch('http://localhost:3000/notifications', {
        method: 'DELETE'
      });
      setNotifications([]);
    } catch (err) {
      console.error("Erreur lors de la suppression totale:", err);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div ref={notificationRef} style={{ position: 'relative', display: 'inline-block' }}>
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
          ':hover': {
            backgroundColor: '#f0f7ff'
          }
        }}
      >
        <Bell size={20} color={showNotifications ? '#1e88e5' : '#2c3e50'} />
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
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
              Notifications
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
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
                  ':hover': {
                    backgroundColor: '#f1f5f9'
                  }
                }}
                title={audioEnabled ? 'Désactiver le son' : 'Activer le son'}
              >
                {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
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
                    ':hover': {
                      backgroundColor: '#f1f5f9',
                      color: '#ef4444'
                    }
                  }}
                  title="Tout effacer"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>

          <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '14px'
              }}>
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