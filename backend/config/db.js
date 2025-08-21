// On importe le module mongoose qui permet d'interagir avec MongoDB en utilisant un ORM (Object Relational Mapping)
const mongoose = require('mongoose');

// Déclaration d'une fonction asynchrone pour établir la connexion à MongoDB
const connectDB = async () => {
  try {
    // Tentative de connexion à la base de données en utilisant l'URI stockée dans la variable d'environnement MONGO_URI
    await mongoose.connect(process.env.MONGO_URI);

    // Si la connexion réussit, on affiche un message dans la console
    console.log("✅ Connexion MongoDB réussie");
  } catch (err) {
    // Si une erreur survient lors de la connexion, on l'affiche dans la console
    console.error("❌ Erreur MongoDB :", err);

    // On arrête l'exécution du processus Node.js avec un code d'erreur (1 = échec)
    process.exit(1);
  }
};

// On exporte la fonction pour pouvoir l'utiliser dans d'autres fichiers de l'application
module.exports = connectDB;
