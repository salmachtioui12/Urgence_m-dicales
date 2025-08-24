🚑 Système de Gestion des Urgences Médicales (SGUM)
SGUM est une application web complète de gestion des urgences médicales, conçue pour optimiser la coordination entre les opérateurs (administrateurs), les hôpitaux et les ambulanciers. Elle permet le suivi en temps réel des interventions, la gestion des ressources (ambulances, personnels) et offre un tableau de bord dynamique avec des statistiques vitales.

✨ Fonctionnalités Principales
🔐 Authentification Sécurisée & Gestion des Utilisateurs
Double Méthode de Connexion :

Classique : Email et mot de passe.

QR Code : Authentification rapide et sécurisée via un QR Code personnel généré avec JWT.

Rôles Multiples : Opérateur (Admin), Hôpitaux, Ambulanciers avec des permissions spécifiques.

Processus d'approbation : Les hôpitaux valident les inscriptions des ambulanciers.

🖥️ Portail Opérateur (Administrateur)
L'opérateur dispose d'un accès complet au système pour :

Superviser le tableau de bord : Visualiser toutes les statistiques et KPIs en temps réel.

Gérer les utilisateurs : Consulter et supprimer tous les comptes (hôpitaux et ambulanciers).

Visualiser les statistiques globales : Accéder aux graphiques sur la répartition des ressources et l'activité.

Surveiller l'ensemble des appels et interventions : Avoir une vision globale de toutes les activités en cours.

🏥 Portail Hôpital
Les utilisateurs de type hôpital bénéficient d'un ensemble complet d'outils de gestion :

Gestion du profil : Consulter et éditer les informations de l'établissement (nom, adresse, coordonnées, etc.).

Gestion des ambulanciers :

Voir tous ses ambulanciers avec leurs informations détaillées (état, expérience, certifications).

Valider ou rejeter les demandes d'inscription des nouveaux ambulanciers.

Gestion des ambulances :

Voir sa flotte d'ambulances avec leur statut (disponible, en mission, maintenance).

Affecter des ambulances à ses ambulanciers pour former des équipes opérationnelles.

Suivi de l'activité : Voir les statistiques et les interventions liées à son établissement.

👨‍⚕️ Portail Ambulancier
Un espace dédié permet à chaque ambulancier de :

Gérer ses missions : Visualiser ses interventions en cours et les marquer comme terminées.

Voir les détails complets : Accéder à tous les détails d'une intervention (patient, localisation, gravité, etc.).

Gérer son profil : Consulter et éditer ses informations personnelles et professionnelles.

Historique des appels : Consulter l'historique complet de tous les appels et interventions auxquels il a été assigné.

🗺️ Carte Interactive des Interventions
Visualisation Géographique : Affichage des appels, ambulances et hôpitaux sur une carte (React Leaflet).

Génération Automatique : Simulation d'appels d'urgence avec localisation et gravité aléatoires.

Affectation Intelligente : Algorithme automatique d'affectation des ambulances basé sur la proximité et la gravité.

Gestion Manuelle : Possibilité de créer des appels manuellement, de modifier leur statut et de réinitialiser le système.

📋 Modules de Gestion
Gestion des Appels : Liste filtrable de tous les appels avec leurs détails complets.

Gestion des Ambulances : Liste, filtrage et visualisation de l'état des ambulances (disponible, en mission, maintenance).

Gestion des Hôpitaux : CRUD complet des hôpitaux et de leurs ambulances associées.

Gestion des Interventions : Suivi des interventions en cours avec possibilité de les clôturer.

🛠️ Stack Technique
Frontend
React (Framework principal)

Chart.js (Graphiques et statistiques)

Leaflet & React-Leaflet (Cartes interactives)

WebSocket API (Communication temps réel)

jsQR (Scanner de QR Codes)

Backend
Node.js (Runtime JavaScript)

Express.js (Framework web)

Mongoose (ODM pour MongoDB)

JSON Web Token (JWT) (Authentification)

bcryptjs (Hashage des mots de passe)

WebSocket (Serveur temps réel)

QRCode (Génération de QR Codes)

Base de Données & APIs Externes
MongoDB (Base de données NoSQL)

Nomination (API de géocodage)

Overpass API (Récupération des données hôpitaux)

🚀 Installation et Démarrage
Prérequis
Assurez-vous d'avoir installé sur votre machine :

Node.js (v18 ou supérieure)

npm ou yarn

MongoDB (local ou une instance distante comme MongoDB Atlas)

1. Cloner le dépôt
bash
git clone <url-de-votre-depot>
cd nom-du-projet
2. Configuration Backend
bash
# Se placer dans le dossier backend
cd backend

# Installer les dépendances
npm install

# Créer un fichier .env à la racine du dossier backend et y ajouter :
MONGO_URI=mongodb://localhost:27017/hopitaux
PORT=3000


# Démarrer le serveur en mode développement
npm run dev
Le serveur backend sera accessible sur http://localhost:3000.

3. Configuration Frontend
bash
# Ouvrir un nouveau terminal et se placer dans le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Démarrer l'application React
npm start
L'application frontend sera accessible sur http://localhost:3001.


🔐 Variables d'Environnement (Backend)
Créez un fichier .env dans le dossier backend :

env
MONGO_URI=mongodb://localhost:27017/hopitaux
PORT=3000
SECRET=maSuperCléSecrèteJWTPourSignerLesTokens
🧪 Comptes de Test
Pour tester l'application, vous pouvez créer des utilisateurs via la route POST /api/auth/register ou utiliser un script de seeding.

📄 Documentation Technique
Une documentation détaillée des routes API, des schémas de base de données et des flux est disponible dans les dossiers documentation/ ou partieX_doc.pdf du projet.

👥 Rôles et Accès
Opérateur (Administrateur) : Accès complet et supervision de tout le système (gestion des users, stats globales, vision de tous les appels et interventions).

Hôpital :

Gère son profil.

Gère ses ambulanciers (validation, consultation).

Gère sa flotte d'ambulances et les affectations.

Consulte les statistiques de son établissement.

Ambulancier :

Gère ses missions (voir détails, marquer comme terminé).

Consulte et édite son profil.

Accède à l'historique complet de ses interventions.

🌐 URLs de l'Application
Frontend (Application) : http://localhost:3001

Backend (API) : http://localhost:3000

Base de données MongoDB : mongodb://localhost:27017/hopitaux

🐛 Dépannage
Erreur de connexion à la BDD : Vérifiez que MongoDB est démarré et que l'URI dans .env est correct.

CORS Errors : Vérifiez que le frontend (3001) communique bien avec le backend (3000).

WebSocket ne fonctionne pas : Vérifiez que le serveur WebSocket est bien initialisé dans server.js.

Port déjà utilisé : Changez le port dans le fichier .env du backend ou kill le processus utilisant le port 3000/3001.


🤝 Contribution
Les contributions sont les bienvenues ! N'hésitez pas à fork le projet, créer une branche pour votre fonctionnalité et ouvrir une Pull Request.


