const Notification = require('../models/Notification');
const Appel = require('../models/Appel');
const { notifierCasCritique } = require('../websocket');
  // Cherche tous les appels critiques qui n'ont pas encore d'ambulance affectée
  // et qui n'ont pas encore été notifiés
async function verifierEtNotifierCritiquesNonAffectes() {
  
  const appelsCritiques = await Appel.find({
    gravite: 'critique',
    ambulanceAffectee: null,
      notifie: false
  });
// Vérifie si une notification existe déjà pour cet appel
  for (const appel of appelsCritiques) {
    const existe = await Notification.findOne({ appelId: appel._id });
    if (existe) continue;
  // Prépare les données de notification
    const notificationData = {
      appelId: appel._id,
      patientName: appel.patientName,
      localisation: appel.localisation,
      heureAppel: appel.heureAppel,
      gravite: appel.gravite,
      dateNotification: new Date()
    };

    // Sauvegarde la notification dans la base
    const notif = new Notification(notificationData);
    await notif.save();
     // Met à jour l'appel pour marquer qu'il a été notifié
await Appel.findByIdAndUpdate(appel._id, { notifie: true });
    // Envoi de la notification en temps réel via WebSocket
    notifierCasCritique({
      _id: notif._id,
      ...notificationData
    });
  }
}

// Supprimer toutes les notifications
const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.status(200).json({ message: 'Toutes les notifications ont été supprimées.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression des notifications.' });
  }
};

// Supprimer une notification spécifique
const deleteNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Notification.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Notification non trouvée.' });
    }
    res.status(200).json({ message: 'Notification supprimée.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la notification.' });
  }
};
module.exports = { verifierEtNotifierCritiquesNonAffectes,
    deleteAllNotifications,
  deleteNotificationById
 };
