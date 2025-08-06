import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";

export default function LayoutAmbulancier() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 970);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);

  const handleNotificationClick = () => {
    setHasNotifications(false);
    navigate("/ambulancier/notifications");
  };

  const isAppelsPage = location.pathname === "/hopital/appels";

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
  };

  const notificationButtonStyle = {
    backgroundColor: isAppelsPage ? "#1e88e5" : "transparent",
    border: "none",
    cursor: "pointer",
    padding: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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

  const mainStyle = {
    padding: "2rem",
    backgroundColor: "#f4f6f8",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
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

  const burgerStyle = {
    display: isMobile ? "block" : "none",
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#2c3e50",
  };

  const actionButtonsStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div>
      <nav style={navStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <NavLink to="/ambulancier" style={logoStyle}>
            youcare
          </NavLink>
          <button style={burgerStyle} onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>
        </div>

        <ul style={ulStyle}>
          <li>
            <NavLink
              to="/ambulancier/appels"
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
              to="/ambulancier/historique"
              style={({ isActive }) => ({
                ...linkStyle,
                ...(isActive ? activeLinkStyle : {}),
              })}
            >
              Historique
            </NavLink>
          </li>
        
          <li>
            <NavLink
              to="/ambulancier/profil"
              style={({ isActive }) => ({
                ...linkStyle,
                ...(isActive ? activeLinkStyle : {}),
              })}
            >
              Profil
            </NavLink>
          </li>
          
          {isMobile && (
            <div style={actionButtonsStyle}>
              <button
                onClick={handleNotificationClick}
                style={{
                  ...notificationButtonStyle,
                  ':hover': {
                    backgroundColor: isAppelsPage ? '#1e88e5' : '#f0f7ff'
                  }
                }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke={isAppelsPage ? "white" : "currentColor"} 
                  width="24" 
                  height="24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                  />
                </svg>
                {hasNotifications && <span style={notificationBadgeStyle}>!</span>}
              </button>
              <button
                onClick={handleLogout}
                style={buttonStyle}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#d32f2f")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#f44336")
                }
              >
                Déconnexion
              </button>
            </div>
          )}
        </ul>

        {!isMobile && (
          <div style={actionButtonsStyle}>
            <button
              onClick={handleNotificationClick}
              style={{
                ...notificationButtonStyle,
                ':hover': {
                  backgroundColor: isAppelsPage ? '#1e88e5' : '#f0f7ff'
                }
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke={isAppelsPage ? "white" : "currentColor"} 
                width="24" 
                height="24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                />
              </svg>
              {hasNotifications && <span style={notificationBadgeStyle}>!</span>}
            </button>
            <button
              onClick={handleLogout}
              style={buttonStyle}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "#d32f2f")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "#f44336")
              }
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