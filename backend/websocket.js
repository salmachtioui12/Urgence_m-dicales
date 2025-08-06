const WebSocket = require('ws');
let wss;
const clientsMap = new Map(); // Map userId -> ws connection
function initWebSocket(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('🟢 Client WebSocket connecté');

    // Lors de la connexion, le client doit s'authentifier (ex : envoyer son userId)
    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message);
        if (parsed.type === 'REGISTER' && parsed.userId) {
          clientsMap.set(parsed.userId, ws);
          ws.userId = parsed.userId;
          console.log(`✅ Ambulancier enregistré: ${parsed.userId}`);
        }
      } catch (err) {
        console.error('❌ Erreur de message WebSocket:', err.message);
      }
    });

    ws.on('close', () => {
      console.log('🔴 Client WebSocket déconnecté');
      if (ws.userId) {
        clientsMap.delete(ws.userId);
      }
    });
  });
}

// Fonction pour envoyer une notification à tous
function notifierCasCritique(appel) {
  if (!wss) return;
  const payload = {
    type: 'ALERTE_CRITIQUE',
    data: appel,
  };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });
}
// statistique 
function notifierStatistiques(stats) {
  if (!wss) return;

  const payload = {
    type: 'STATS_UPDATE',
    data: stats,
  };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });
}
function notifierDerniersAppels(appels) {
  if (!wss) return;
  const payload = {
    type: 'DERNIERS_APPELS',
    data: appels,
  };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });
}
function notifierAmbulancierIntervention(userId, data) {
  const ws = clientsMap.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'NOUVELLE_INTERVENTION',
      data
    }));
  }
}

module.exports = { initWebSocket, notifierCasCritique ,notifierStatistiques,notifierDerniersAppels,notifierAmbulancierIntervention};
