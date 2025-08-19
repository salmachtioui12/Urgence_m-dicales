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
  Package // Nouvelle icône pour Ressources
} from "lucide-react";
import WebSocketNotifications from "../WebSocketNotifications";

export default function LayoutDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 970);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [ambulancesOpen, setAmbulancesOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const menu = [
    { icon: <Home size={20} />, label: "Accueil", path: "/dashboard" },
    { icon: <Map size={20} />, label: "Cart", path: "/cart" },
    { icon: <PhoneCall size={20} />, label: "Appels d'urgence", path: "/appels" },
    { icon: <Hospital size={20} />, label: "Hôpitaux", path: "/hopitaux" },
    { icon: <ListOrdered size={20} />, label: "Interventions", path: "/interventions" },
    { icon: <BarChart2 size={20} />, label: "Statistiques", path: "/statistiques" },
  ];

  return (
    <div>
      <nav style={navStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <NavLink to="/dashboard" style={logoStyle}>
            <Hospital size={24} /> Dashboard
          </NavLink>
          <button 
            style={{ 
              background: "none", 
              border: "none", 
              cursor: "pointer",
              display: isMobile ? "block" : "none" 
            }} 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>

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
              <Package size={20} /> {/* Icône changée de Ambulance à Package */}
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
            {!isMobile && "Déconnexion"}
          </button>
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