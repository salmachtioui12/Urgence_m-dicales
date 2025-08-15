require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http');
const { verifierEtNotifierCritiquesNonAffectes } = require('./services/notifications.service');
const { getAllStats } = require('./services/stats.service');
const { notifierStatistiques, notifierDerniersAppels, initWebSocket } = require('./websocket');
const { getDerniersAppels } = require('./services/appels.service');

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json());

// Connexion MongoDB
connectDB();

// Routes
const authRoutes = require('./routes/auth.routes');
const interventionsRoutes = require("./routes/interventions.routes");
const ambulancesRoutes = require("./routes/ambulances.routes");
const kpiRoutes = require('./routes/kpi.routes');

app.use('/api/auth', authRoutes);
app.use("/api/ambulances", ambulancesRoutes);
app.use("/interventions", interventionsRoutes);
app.use('/appels', require('./routes/appels.routes'));
app.use('/agents', require('./routes/agents.routes'));
app.use('/api/hopitaux', require('./routes/hopitaux.routes'));
app.use('/notifications', require('./routes/notifications.routes'));
app.use('/api/kpi', kpiRoutes);
const affectationsRouter = require('./routes/affectations.routes');
app.use('/api/affectations', affectationsRouter);
app.use('/users',require('./routes/listeusers.route'));
// WebSocket
initWebSocket(server);
const ambulancierRoutes = require('./routes/ambulancier.routes');
app.use('/api/ambulanciers', ambulancierRoutes);
// Simulation
const { startAutoGeneration } = require('./services/appels.service');
const { simulerDeplacement } = require('./services/agents.service');
// startAutoGeneration();
setInterval(simulerDeplacement, 5000);

// Notifications régulières
setInterval(() => {
  verifierEtNotifierCritiquesNonAffectes()
    .catch(err => console.error("Erreur vérification notifications :", err));
}, 10000);

setInterval(async () => {
  try {
    const stats = await getAllStats();
    notifierStatistiques(stats);
  } catch (err) {
    console.error('Erreur envoi statistiques WebSocket :', err);
  }
}, 10000);

setInterval(async () => {
  try {
    const derniersAppels = await getDerniersAppels();
    notifierDerniersAppels(derniersAppels);
  } catch (err) {
    console.error("Erreur notification appels récents :", err);
  }
}, 10000);

// Démarrage serveur
server.listen(PORT, () => {
  console.log(`✅ Serveur backend + WebSocket sur http://localhost:${PORT}`);
});
