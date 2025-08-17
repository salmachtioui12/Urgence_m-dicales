// models/Ambulancier.js
const mongoose = require('mongoose');

const PermisSchema = new mongoose.Schema({
  numero: String,
  categorie: String,
  dateDelivrance: Date,
  dateExpiration: Date
});

const AmbulancierSchema = new mongoose.Schema({
  nom: String,
  prenom: String,
  sexe: String,
  dateNaissance: Date,
  telephone: String,
  email: String,
  adresse: String,
  matricule: String,
  hopitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hopital" },
  anneesExperience: Number,
  services: [String],
  permis: PermisSchema,
  certifications: [String],
  statut: { type: String, default: 'disponible' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   emailHopital: String,
});

module.exports = mongoose.model('Ambulancier', AmbulancierSchema);
