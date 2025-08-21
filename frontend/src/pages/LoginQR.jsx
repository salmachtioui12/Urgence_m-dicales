import React, { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LoginQR.css";

export default function LoginQR() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isScanning = useRef(false);

  useEffect(() => {
    initScanner();
    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    isScanning.current = false;
  };

  const initScanner = async () => {
    stopScanner();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          isScanning.current = true;
          scanQRCode();
        };
      }
      
      setCameraPermission(true);
      setError("");
      
    } catch (err) {
      console.error("Erreur accès caméra:", err);
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      setCameraPermission(false);
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      
      if (code) {
        console.log("QR Code détecté:", code.data);
        onScanSuccess(code.data);
        return;
      }
    }
    
    if (isScanning.current) {
      animationFrameRef.current = requestAnimationFrame(scanQRCode);
    }
  };

  const scanQRFromFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        const maxSize = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        context.drawImage(img, 0, 0, width, height);
        
        const imageData = context.getImageData(0, 0, width, height);
        const code = jsQR(imageData.data, width, height, {
          inversionAttempts: "dontInvert",
        });
        
        if (code) {
          console.log("QR Code détecté depuis fichier:", code.data);
          onScanSuccess(code.data);
        } else {
          setError("Aucun QR code détecté dans l'image");
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const onScanSuccess = async (decodedText) => {
    if (isLoading) return;
    
    setError("");
    setSuccess("QR Code détecté! Traitement en cours...");
    setIsLoading(true);
    
    stopScanner();

    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/qr/login",
        { token: decodedText }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("tokenUpdated"));

      setSuccess("Connexion réussie! Redirection...");

      setTimeout(() => {
        const role = res.data.user.role?.toLowerCase();
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
            navigate("/login");
            break;
        }
      }, 1000);
    } catch (err) {
      console.error("Erreur login QR :", err);
      setError("QR invalide ou expiré");
      setSuccess("");
      setIsLoading(false);

      setTimeout(() => {
        initScanner();
      }, 1500);
    }
  };

  const handleResetScanner = () => {
    setError("");
    setSuccess("");
    initScanner();
  };

  const handleFileSelectClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      fileInputRef.current.files = e.dataTransfer.files;
      scanQRFromFile(e);
    }
  };

  return (
    <div className="login-qr-container">
      <div className="login-qr-card">
        <div className="qr-header">
          <h2>Connexion par QR Code</h2>
          <p>Scannez votre code QR pour accéder à votre compte</p>
        </div>
        
        {error && (
          <div className="message error-message">
            <span className="message-icon">⚠️</span>
            {error}
          </div>
        )}
        
        {success && (
          <div className="message success-message">
            <span className="message-icon">✅</span>
            {success}
          </div>
        )}

        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Traitement en cours...</p>
          </div>
        )}
        
        <div className="qr-reader">
          <video
            ref={videoRef}
            id="qr-video"
            className="qr-video"
            playsInline
            muted
          ></video>
          <canvas ref={canvasRef} style={{display: 'none'}}></canvas>
          <div className="scan-overlay">
            <div className="scan-frame">
              <div className="scan-corner top-left"></div>
              <div className="scan-corner top-right"></div>
              <div className="scan-corner bottom-left"></div>
              <div className="scan-corner bottom-right"></div>
            </div>
            <div className="scan-line"></div>
          </div>
        </div>
        
        <div 
          className={`file-upload-section ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={scanQRFromFile}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <div className="upload-icon">📁</div>
          <p>Glissez-déposez une image avec QR Code ici ou</p>
          <button 
            onClick={handleFileSelectClick}
            className="btn-file-upload"
          >
            Choisir un fichier
          </button>
        </div>
        
        <div className="button-group">
          <button 
            onClick={() => navigate("/login")}
            className="btn-secondary"
          >
            Retour à la connexion
          </button>

          {!cameraPermission && (
            <button 
              onClick={initScanner}
              className="btn-primary"
            >
              Activer la caméra
            </button>
          )}

          <button 
            onClick={handleResetScanner}
            className="btn-primary"
          >
            Redémarrer le scanner
          </button>
        </div>
      </div>
    </div>
  );
}