import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Connexion réussie !");
        console.log("User reçu:", data.user);

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setSuccess("Connexion réussie !");
        setError("");

        window.dispatchEvent(new Event("tokenUpdated"));

        setTimeout(() => {
          const role = data.user.role?.toLowerCase();
          switch (role) {
            case "hopital":
              navigate("/hopital/dashboard");
              break;
            case "ambulancier":
              navigate("/ambulancier/appels");
              break;
            case "operateur":
              navigate("/dashboard");
              break;
            default:
              console.warn("Rôle inconnu :", role);
              setError("Rôle utilisateur non reconnu");
          }
        }, 1000);
      } else {
        setError(data.message || "Identifiants invalides");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur réseau");
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-header">
        <h1>Bienvenue</h1>
        <p>Connectez-vous pour accéder à votre compte</p>
      </div>

      <div className="login-form-container">
        {error && (
          <div className="alert error">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert success">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="exemple@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={isLoading} className="login-button">
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Connexion...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <div className="divider">
          <span>Ou</span>
        </div>

        {/* Lien vers la connexion par QR Code */}
        <div className="qr-login-section">
          <Link 
            to="http://localhost:3001/connexionwithQR" 
            className="qr-login-button"
            target="_blank" // Ouvre dans un nouvel onglet
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M3 7V3H7V7H3Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M17 7V3H21V7H17Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M3 21V17H7V21H3Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M17 21V17H21V21H17Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M7 7H17V17H7V7Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            Se connecter avec un QR Code
          </Link>
        </div>

        <div className="login-footer">
          <p>
            Pas encore de compte ? <Link to="/register">S'inscrire</Link>
          </p>
        </div>
      </div>

      <style>
        {`
        .login-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%);
          padding: 2rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .login-header {
          text-align: center;
          margin-bottom: 3rem;
          max-width: 400px;
        }

        .login-header h1 {
          font-size: 2rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .login-header p {
          color: #64748b;
          font-size: 1rem;
        }

        .login-form-container {
          width: 100%;
          max-width: 500px;
          background-color: white;
          padding: 2rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .alert {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          margin-bottom: 1.5rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .alert svg {
          width: 1.25rem;
          height: 1.25rem;
          margin-right: 0.75rem;
        }

        .alert.error {
          background-color: #fef2f2;
          color: #dc2626;
        }

        .alert.success {
          background-color: #f0fdf4;
          color: #16a34a;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #334155;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          transition: all 0.15s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #2979ff;
          box-shadow: 0 0 0 1px #2979ff;
        }

        .form-group input::placeholder {
          color: #94a3b8;
        }

        .login-button {
          width: 100%;
          padding: 0.75rem;
          background-color: #2979ff;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .login-button:hover {
          background-color: #2979ff;
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          background-color: #2979ff;
        }

        .spinner {
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .divider {
          display: flex;
          align-items: center;
          margin: 1.5rem 0;
          color: #64748b;
          font-size: 0.875rem;
        }

        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background-color: #e2e8f0;
        }

        .divider span {
          padding: 0 1rem;
        }

        .qr-login-section {
          margin: 1rem 0;
        }

        .qr-login-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem;
          background-color: white;
          color: #4f46e5;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .qr-login-button:hover {
          background-color: #f8fafc;
          border-color: #cbd5e1;
        }

        .login-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.875rem;
          color: #64748b;
        }

        .login-footer a {
          color: #2979ff;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.15s;
        }

        .login-footer a:hover {
          color: #2979ff;
          text-decoration: underline;
        }
      `}
      </style>
    </div>
  );
}