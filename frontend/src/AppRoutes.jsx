// AppRoutes.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Pages publiques
import Login from "./pages/Login";
import Register from "./pages/Register";

// Layouts
import Layout from "./Layout"; // opérateur
import LayoutHopital from "./pages_hopital/components/LayoutHopital";
import LayoutAmbulancier from "./pages_ambilancier/components/LayoutAmbilancier";

// ProtectedRoute
import ProtectedRoute from "./components/ProtectedRoute";

// 📦 Pages Opérateur
import DashboardKPI from "./components/Dashboard/DashboardKPI";
import Cart from "./pages/Carte/cart";
import ListeAppels from "./pages/Appels/ListeAppels";
import ListeHopitaux from "./pages/Hopitaux/ListeHopitaux";
import ListeAmbulances from "./pages/Ambulances/ListeAmbulances";
import ListeInterventions from "./pages/Interventions/ListeInterventions";
import DemandesAmbulanciers from "./pages_hopital/pages/DemandesAmbulanciers";
import NotificationsPage from "./components/WebSocketNotifications";
import Listeusers from "./components/listeusers/listeusers";
// 🏥 Pages Hopital
import DashboardHopital from "./pages_hopital/pages/DashbordHopital";
import ProfilHopital from "./pages_hopital/pages/ProfilHopital";
import NotificationHopital from "./pages_hopital/pages/NotificationHopital";
import Demandes_approuves from "./pages_hopital/pages/Demandes_approuves";
import ModifierProfilHopital from "./pages_hopital/pages/ModifierProfilHopital";
import Affectation from "./pages_hopital/pages/affectation"
// 🚑 Pages Ambulancier
import ListeAppelsAmbulancier from "./pages_ambilancier/pages/ListeAppelsAmbulancier";
import DetailsAppel from "./pages_ambilancier/pages/DetailsAppel";
import HistoriqueInterventions from "./pages_ambilancier/pages/Historique_interventions";
import NotificationsAmbulancier from "./pages_ambilancier/pages/NotificationsAmbulancier";
import ProfilAmbulancier from "./pages_ambilancier/pages/ProfilAmbulancier";
import ModifierProfilAmbulancier from "./pages_ambilancier/pages/ModifierProfilAmbulancier";

// 🔐 Fonction rôle
const getUserRole = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded?.role || null;
  } catch (e) {
    return null;
  }
};

export default function AppRoutes() {
  const [role, setRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    setRole(getUserRole());
  }, []);

  useEffect(() => {
    const handleTokenUpdate = () => {
      setRole(getUserRole());
    };
    window.addEventListener("tokenUpdated", handleTokenUpdate);
    return () => window.removeEventListener("tokenUpdated", handleTokenUpdate);
  }, []);

  if (
    role === null &&
    location.pathname !== "/login" &&
    location.pathname !== "/register"
  ) {
    return <div>Chargement...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 📦 Opérateur */}
      {role === "operateur" && (
        <Route
          path="/"
          element={
            <ProtectedRoute role="operateur">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<DashboardKPI />} />
          <Route path="cart" element={<Cart />} />
          <Route path="appels" element={<ListeAppels />} />
          <Route path="hopitaux" element={<ListeHopitaux />} />
          <Route path="ambulances" element={<ListeAmbulances />} />
          <Route path="interventions" element={<ListeInterventions />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="demandes-ambulanciers" element={<DemandesAmbulanciers />} />
           <Route path="/statistiques" element={<Listeusers/>} />
        </Route>
      )}

      {/* 🏥 Hopital */}
      {role === "hopital" && (
        <Route
          path="/hopital"
          element={
            <ProtectedRoute role="hopital">
              <LayoutHopital />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardHopital />} />
          <Route path="demandes" element={<DemandesAmbulanciers />} />
          <Route path="profil" element={<ProfilHopital />} />
          <Route path="ambulanciers" element={<Demandes_approuves />} />
          <Route path="appels" element={<NotificationHopital />} />
          <Route path="modification" element={<ModifierProfilHopital />} />
          <Route path="affectation" element={<Affectation />} />
         
          
        </Route>
      )}

      {/* 🚑 Ambulancier */}
      {role === "ambulancier" && (
        <Route
          path="/ambulancier"
          element={
            <ProtectedRoute role="ambulancier">
              <LayoutAmbulancier />
            </ProtectedRoute>
          }
        >
          <Route path="appels" element={<ListeAppelsAmbulancier />} />
          <Route path="appels/:id" element={<DetailsAppel />} />
          <Route path="historique" element={<HistoriqueInterventions />} />
          <Route path="notifications" element={<NotificationsAmbulancier />} />
          <Route path="profil" element={<ProfilAmbulancier />} />
          <Route path="modifier" element={<ModifierProfilAmbulancier />} />
        </Route>
      )}

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
