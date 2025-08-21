const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['hopital', 'ambulancier'], required: true },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
   qrToken: String, // 🔥 ajouté
  status: {
    type: String,
    enum: ['en_attente', 'approuve', 'rejete'],
    default: function () {
      return this.role === 'ambulancier' ? 'en_attente' : 'approuve';
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
