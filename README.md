# 🚑 Système de Gestion des Urgences Médicales (SGUM)

**SGUM** est une application web complète de gestion des urgences médicales, conçue pour optimiser la coordination entre les opérateurs (administrateurs), les hôpitaux et les ambulanciers.  
Elle permet le suivi **en temps réel** des interventions, la gestion des ressources (ambulances, personnels) et offre un **tableau de bord dynamique** avec des statistiques vitales.

---

## ✨ Fonctionnalités Principales

### 🔐 Authentification Sécurisée & Gestion des Utilisateurs
- Connexion **classique** : Email + mot de passe  
- Connexion **par QR Code** : Authentification rapide et sécurisée via JWT  
- Rôles multiples : **Opérateur (Admin)**, **Hôpital**, **Ambulancier**  
- Processus d’approbation : Les hôpitaux valident les inscriptions des ambulanciers  

---

### 🖥️ Portail Opérateur (Administrateur)
- Supervision du tableau de bord (stats et KPIs en temps réel)  
- Gestion des utilisateurs (consultation, suppression)  
- Visualisation des statistiques globales  
- Suivi des appels et interventions en temps réel  

---

### 🏥 Portail Hôpital
- **Gestion du profil** (nom, adresse, coordonnées)  
- **Gestion des ambulanciers** :  
  - Voir la liste des ambulanciers  
  - Valider / rejeter les inscriptions  
- **Gestion des ambulances** :  
  - Suivre la flotte avec leur statut (disponible, mission, maintenance)  
  - Affecter des ambulances à des équipes  
- **Statistiques et interventions** liées à l’établissement  

---

### 👨‍⚕️ Portail Ambulancier
- Suivi des missions (visualisation + clôture)  
- Détails des interventions (patient, localisation, gravité, etc.)  
- Gestion du profil personnel et professionnel  
- Historique complet des appels et interventions  

---

### 🗺️ Carte Interactive des Interventions
- **Visualisation géographique** des appels, ambulances, hôpitaux (React Leaflet)  
- **Simulation automatique** : génération d’appels avec gravité aléatoire  
- **Affectation intelligente** : algorithme basé sur la proximité + gravité  
- **Gestion manuelle** : créer des appels, modifier les statuts, réinitialiser  

---

### 📋 Modules de Gestion
- **Appels** : Liste filtrable avec détails complets  
- **Ambulances** : Liste + filtrage (type, état)  
- **Hôpitaux** : CRUD complet (ajout, édition, suppression)  
- **Interventions** : Suivi en temps réel + clôture possible  

---

## 🛠️ Stack Technique

### Frontend
- React.js (framework principal)  
- Chart.js (graphiques/statistiques)  
- Leaflet & React-Leaflet (cartes interactives)  
- WebSocket API (communication temps réel)  
- jsQR (scanner de QR Codes)  

### Backend
- Node.js + Express.js  
- Mongoose (ODM MongoDB)  
- JWT (authentification sécurisée)  
- bcryptjs (hashage des mots de passe)  
- WebSocket (serveur temps réel)  
- QRCode (génération de QR Codes)  

### Base de Données & APIs
- MongoDB (NoSQL)  
- Nominatim (géocodage)  
- Overpass API (récupération des hôpitaux)  

---

🚀 Installation et Démarrage
🔹 Prérequis

Avant de commencer, assurez-vous d’avoir installé :

Node.js (v18 ou supérieure)

npm ou yarn

MongoDB (en local ou une instance distante comme MongoDB Atlas)

🔹 Étapes d’installation
1. Cloner le dépôt
git clone <url-du-depot>
cd nom-du-projet

2. Configuration du Backend
cd backend
npm install


Créer un fichier .env dans le dossier backend avec le contenu suivant :

MONGO_URI=mongodb://localhost:27017/hopitaux
PORT=3000
SECRET=VotreCléSecrèteJWTSuperSecurisée


Démarrer le serveur backend :

npm run dev


➡️ Le backend sera accessible sur : http://localhost:3000

3. Configuration du Frontend
cd frontend
npm install
npm start


➡️ Le frontend sera accessible sur : http://localhost:3001

🔐 Variables d’Environnement (Backend)

Exemple de fichier .env :

MONGO_URI=mongodb://localhost:27017/hopitaux
PORT=3000
SECRET=maSuperCléSecrèteJWTPourSignerLesTokens

🧪 Comptes de Test

Création via l’endpoint :
POST /api/auth/register

Possibilité d’utiliser un script de seeding pour remplir la base avec des données fictives.

👥 Rôles et Accès

Opérateur (Admin) : supervision complète (utilisateurs, stats, appels, interventions).

Hôpital : gestion du profil, ambulanciers, ambulances, statistiques locales.

Ambulancier : gestion des missions, profil, historique.

🌐 URLs

Frontend : http://localhost:3001

Backend API : http://localhost:3000

Base MongoDB : mongodb://localhost:27017/hopitaux

🐛 Dépannage

Erreur de connexion BDD : Vérifiez que MongoDB est lancé et que MONGO_URI est correct.

Erreur CORS : Vérifiez que le frontend (port 3001) communique bien avec le backend (port 3000).

WebSocket ne fonctionne pas : Vérifiez qu’il est bien initialisé dans server.js.

Port déjà utilisé : Changez le port dans le fichier .env ou libérez le port occupé.




