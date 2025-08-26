import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Map,
  Ambulance,
  PhoneCall,
  Hospital,
  ListOrdered,
  BarChart2,
  LogOut,
  Menu,
  Bell,
  ChevronDown,
  ChevronUp,
  Package,
  QrCode,
  X
} from "lucide-react";
import WebSocketNotifications from "../WebSocketNotifications";
// Composant principal qui définit le layout (structure générale) du tableau de bord
export default function LayoutDashboard() {
  const navigate = useNavigate(); // Pour naviguer entre les routes
  const location = useLocation(); // Pour obtenir la route actuelle

  // États de gestion de l’UI
  const [isMobile, setIsMobile] = useState(window.innerWidth < 970); // Détection si l’écran est mobile
  const [menuOpen, setMenuOpen] = useState(false); // Gérer l’ouverture du menu en mobile
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false); // Panneau notifications
  const [ambulancesOpen, setAmbulancesOpen] = useState(false); // Sous-menu "Ressources"
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar en mode mobile

  // Effet : écouter les changements de taille d’écran pour adapter l’affichage mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 970;
      setIsMobile(mobile);
      if (!mobile) {
        // En desktop on force la fermeture des menus latéraux
        setMenuOpen(false);
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Styles (CSS-in-JS) pour la navigation, les liens, la sidebar, etc.
  const navStyle = {
    backgroundColor: "#ffffff",
    padding: "1rem 2rem",
    borderRadius: "50px",
    margin: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
    position: "relative",
    zIndex: 1000,
  };

  const logoStyle = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#1e88e5",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const ulStyle = {
    listStyle: "none",
    display: isMobile ? (menuOpen ? "flex" : "none") : "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: "1rem",
    margin: 0,
    padding: 0,
    width: isMobile ? "100%" : "auto",
    textAlign: isMobile ? "center" : "left",
    position: "relative",
  };

  const linkStyle = {
    color: "#2c3e50",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "1rem",
    padding: "0.5rem 1rem",
    borderRadius: "50px",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const activeLinkStyle = {
    backgroundColor: "#2979ff",
    color: "#fff",
  };

  // Styles du sous-menu Ressources (desktop)
  const subMenuStyle = {
    position: "absolute",
    top: "100%",
    left: 0,
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    padding: "0.5rem 0",
    minWidth: "200px",
    zIndex: 1001,
    display: ambulancesOpen ? "block" : "none",
  };

  const subMenuItemStyle = {
    ...linkStyle,
    padding: "0.5rem 1.5rem",
    fontSize: "0.9rem",
    borderRadius: "0",
    display: "block",
    width: "100%",
  };

  // Styles pour la sidebar (uniquement en mode mobile)
  const sidebarStyle = {
    position: "fixed",
    top: 0,
    left: sidebarOpen ? "0" : "-250px",
    width: "250px",
    height: "100vh",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    paddingTop: "20px",
    boxShadow: "2px 0 10px rgba(0, 0, 0, 0.2)",
    zIndex: 2000,
    transition: "left 0.3s ease",
    overflowY: "auto",
  };

  const sidebarLinkStyle = {
    color: "#2c3e50",
    textDecoration: "none",
    padding: "15px 20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    transition: "all 0.3s ease",
  };

  const sidebarActiveLinkStyle = {
    backgroundColor: "#2979ff",
    color: "#fff",
  };

  // Overlay sombre derrière la sidebar
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1500,
    display: sidebarOpen && isMobile ? "block" : "none",
  };

  // Menu principal avec icônes et chemins de navigation
  const menu = [
    { icon: <Home size={20} />, label: "Accueil", path: "/dashboard" },
    { icon: <Map size={20} />, label: "Cart", path: "/cart" },
    { icon: <PhoneCall size={20} />, label: "Appels d'urgence", path: "/appels" },
    { icon: <Hospital size={20} />, label: "Hôpitaux", path: "/hopitaux" },
    { icon: <ListOrdered size={20} />, label: "Interventions", path: "/interventions" },
    { icon: <BarChart2 size={20} />, label: "Statistiques", path: "/statistiques" },
    { icon: <QrCode size={20} />, label: "MyQrCode", path: "/MyQrCode" },
  ];
  return (
    <div>
      {/* Overlay pour mobile */}
      <div style={overlayStyle} onClick={() => setSidebarOpen(false)}></div>
      
      {/* Sidebar (uniquement en mode mobile) */}
      {isMobile && (
        <div style={sidebarStyle}>
          <div style={{ padding: "0 20px 15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e0e0e0" }}>
            <h2 style={{ color: "#2c3e50", margin: 0, fontSize: "1.2rem" }}>Menu</h2>
            <X 
              size={24} 
              color="#2c3e50" 
              onClick={() => setSidebarOpen(false)} 
              style={{ cursor: "pointer" }}
            />
          </div>
          
          <nav style={{ flex: 1, padding: "10px 0" }}>
            {menu.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                style={({ isActive }) => ({
                  ...sidebarLinkStyle,
                  ...(isActive ? sidebarActiveLinkStyle : {}),
                })}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
            
            {/* Section Ressources dans la sidebar */}
            <div 
              style={{ 
                padding: "15px 20px", 
                color: "#2c3e50", 
                fontWeight: "bold", 
                borderTop: "1px solid #e0e0e0", 
                marginTop: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer"
              }}
              onClick={() => setAmbulancesOpen(!ambulancesOpen)}
            >
              <span>Ressources</span>
              {ambulancesOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
            
            <div style={{ display: ambulancesOpen ? "block" : "none" }}>
              <NavLink
                to="/ambulances"
                style={({ isActive }) => ({
                  ...sidebarLinkStyle,
                  ...(isActive ? sidebarActiveLinkStyle : {}),
                  paddingLeft: "40px",
                })}
                onClick={() => setSidebarOpen(false)}
              >
                <Ambulance size={20} />
                <span>Liste des ambulances</span>
              </NavLink>
              <NavLink
                to="/ambulancier"
                style={({ isActive }) => ({
                  ...sidebarLinkStyle,
                  ...(isActive ? sidebarActiveLinkStyle : {}),
                  paddingLeft: "40px",
                })}
                onClick={() => setSidebarOpen(false)}
              >
                <Package size={20} />
                <span>Liste des ambulanciers</span>
              </NavLink>
            </div>
          </nav>
          
          <div style={{ padding: "20px", borderTop: "1px solid #e0e0e0" }}>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
              }}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#f44336",
                border: "none",
                color: "#fff",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>
      )}

      <nav style={navStyle}>
        {/* Bouton pour ouvrir la sidebar en mode mobile */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Menu size={24} color="#2c3e50" />
          </button>
        )}
        
        <ul style={ulStyle}>
          {menu.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                style={({ isActive }) => ({
                  ...linkStyle,
                  ...(isActive ? activeLinkStyle : {}),
                })}
              >
                {item.icon}
                {!isMobile && item.label}
              </NavLink>
            </li>
          ))}

          {/* Menu Ressources avec sous-menu flottant */}
          <li style={{ position: "relative" }}>
            <button
              onClick={() => setAmbulancesOpen(!ambulancesOpen)}
              style={{
                ...linkStyle,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Package size={20} />
              {!isMobile && (
                <>
                  Ressources
                  {ambulancesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </>
              )}
            </button>
            
            <ul style={subMenuStyle}>
              <li>
                <NavLink
                  to="/ambulances"
                  style={({ isActive }) => ({
                    ...subMenuItemStyle,
                    ...(isActive ? activeLinkStyle : {}),
                  })}
                  onClick={() => setAmbulancesOpen(false)}
                >
                  Liste des ambulances
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/ambulancier"
                  style={({ isActive }) => ({
                    ...subMenuItemStyle,
                    ...(isActive ? activeLinkStyle : {}),
                  })}
                  onClick={() => setAmbulancesOpen(false)}
                >
                 Liste des ambulanciers
                </NavLink>
              </li>
            </ul>
          </li>
        </ul>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <WebSocketNotifications />
          {!isMobile && (
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
              }}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#f44336",
                border: "none",
                color: "#fff",
                borderRadius: "50px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          )}
        </div>
      </nav>

      <main style={{
        padding: "2rem",
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
      }}>
        <Outlet />
      </main>
    </div>
  );
}