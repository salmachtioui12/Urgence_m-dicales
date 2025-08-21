import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import 'flag-icons/css/flag-icons.min.css';

export default function LayoutHopital() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 970);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);

  // Vérifie si la route actuelle est la page des appels
  const isAppelsPage = location.pathname === "/hopital/appels";

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 970;
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
  };

  const logoStyle = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#1e88e5",
    textDecoration: "none",
  };

  const ulStyle = {
    listStyle: "none",
    display: isMobile ? (menuOpen ? "flex" : "none") : "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: "1.5rem",
    margin: 0,
    padding: 0,
    width: isMobile ? "100%" : "auto",
    textAlign: isMobile ? "center" : "left",
  };

  const linkStyle = {
    color: "#2c3e50",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "1rem",
    padding: "0.5rem 1rem",
    borderRadius: "50px",
    transition: "background-color 0.3s ease",
  };

  const activeLinkStyle = {
    backgroundColor: "#2979ff",
    color: "#fff",
  };

  const buttonStyle = {
    padding: "0.5rem 1rem",
    backgroundColor: "#f44336",
    border: "none",
    color: "#fff",
    borderRadius: "50px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "0.9rem",
    marginTop: isMobile ? "1rem" : "0",
  };

  const notificationButtonStyle = {
    backgroundColor: isAppelsPage ? "#1e88e5" : "transparent",
    border: "none",
    cursor: "pointer",
    padding: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "1rem",
    borderRadius: "50%",
    transition: "all 0.3s ease",
    width: "48px",
    height: "48px",
    position: "relative",
  };

  const notificationBadgeStyle = {
    position: "absolute",
    top: "8px",
    right: "8px",
    backgroundColor: "#f44336",
    color: "white",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    fontSize: "0.7rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  };

  const mainStyle = {
    padding: "2rem",
    backgroundColor: "#f4f6f8",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  };

  const burgerStyle = {
    display: isMobile ? "block" : "none",
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#2c3e50",
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleNotificationClick = () => {
    setHasNotifications(false);
    navigate("/hopital/appels");
  };

  return (
    <div>
      <nav style={navStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <NavLink to="/hopital" style={logoStyle}>
            youcare
          </NavLink>
          <button style={burgerStyle} onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>
        </div>

        <ul style={ulStyle}>
          <li>
            <NavLink
              to="/hopital/dashboard"
              style={({ isActive }) => ({
                ...linkStyle,
                ...(isActive ? activeLinkStyle : {}),
              })}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/hopital/demandes"
              style={({ isActive }) => ({
                ...linkStyle,
                ...(isActive ? activeLinkStyle : {}),
              })}
            >
              Demandes
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/hopital/ambulanciers"
              style={({ isActive }) => ({
                ...linkStyle,
                ...(isActive ? activeLinkStyle : {}),
              })}
            >
              Ambulanciers
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/hopital/affectation"
              style={({ isActive }) => ({
                ...linkStyle,
                ...(isActive ? activeLinkStyle : {}),
              })}
            >
              Affectations
            </NavLink>
          </li>
            <li>
            <NavLink
              to="/hopital/appels"
              style={({ isActive }) => ({
                ...linkStyle,
                ...(isActive ? activeLinkStyle : {}),
              })}
            >
              Appels
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/hopital/profil"
              style={({ isActive }) => ({
                ...linkStyle,
                ...(isActive ? activeLinkStyle : {}),
              })}
            >
              Profil
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/hopital/MyQrCode"
              style={({ isActive }) => ({
                ...linkStyle,
                ...(isActive ? activeLinkStyle : {}),
              })}
            >
                MyQrCode
            </NavLink>
          </li>
        
          {isMobile && (
            <>
              
              <li>
                <button
                  onClick={handleLogout}
                  style={buttonStyle}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#d32f2f")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#f44336")}
                >
                  Déconnexion
                </button>
              </li>
            </>
          )}
        </ul>

        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            
            <button
              onClick={handleLogout}
              style={buttonStyle}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#d32f2f")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#f44336")}
            >
              Déconnexion
            </button>
          </div>
        )}
      </nav>
      <main style={mainStyle}>
        <Outlet />
      </main>
    </div>
  );
}