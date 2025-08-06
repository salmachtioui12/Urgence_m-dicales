const mongoose = require('mongoose');

const AffectationAmbulancierSchema = new mongoose.Schema({
  ambulanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ambulance',
    required: true
  },
  ambulancierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ambulancier',
    required: true
  },
  dateDebut: {
    type: Date,
    required: true,
    default: Date.now
  },
  dateFin: Date // null = en cours
});

module.exports = mongoose.model('AffectationAmbulancier', AffectationAmbulancierSchema);
