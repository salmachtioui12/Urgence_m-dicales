import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function MyQrCode() {
  // État qui va contenir l'URL de l'image du QR code
  const [qrUrl, setQrUrl] = useState("");
  // useRef pour cibler la div contenant le QR code afin de l'exporter en PDF
  const qrRef = useRef(null);

  // useEffect s'exécute au montage du composant
  useEffect(() => {
    const fetchQr = async () => {
      try {
        // Récupérer l'utilisateur connecté (stocké dans le localStorage)
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return;

        // Appel au backend pour obtenir le QR code de cet utilisateur
        const res = await axios.get(`http://localhost:3000/api/auth/qr/${user.id}`);
        setQrUrl(res.data.qr); // Sauvegarde l’URL du QR dans l’état
      } catch (err) {
        console.error("Erreur récupération QR:", err);
      }
    };

    fetchQr();
  }, []);

  // Fonction pour télécharger le QR code en PDF
  const handleDownloadPDF = async () => {
    if (!qrRef.current) return; // Si le QR n’est pas encore affiché → on sort

    // On prend un "screenshot" de la div contenant le QR
    const canvas = await html2canvas(qrRef.current);
    const imgData = canvas.toDataURL("image/png");

    // Création d'un PDF vide avec jsPDF
    const pdf = new jsPDF();

    // Ajustement de la taille de l’image au format du PDF
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Ajout de l’image dans le PDF
    pdf.addImage(imgData, "PNG", 0, 20, pdfWidth, pdfHeight);
    pdf.save("MonQRCode.pdf"); // Téléchargement
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Mon QR Code</h2>
      <p>Scannez ce code pour vous connecter rapidement.</p>

      <div ref={qrRef}>
        {qrUrl ? (
          <img src={qrUrl} alt="QR Code de connexion" style={{ width: 250 }} />
        ) : (
          <p>Chargement...</p>
        )}
      </div>

      {qrUrl && (
        // Alternative sans icône
<button
  onClick={handleDownloadPDF}
  style={{ 
    marginTop: "3rem", 
    padding: "12px 24px", 
    cursor: "pointer",
    backgroundColor: "#2979ff",
    color: "white",
    border: "none",
    borderRadius: "50px",
    fontWeight: "600",
    fontSize: "1rem",
    margin: "0 auto",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 8px rgba(41, 121, 255, 0.3)"
  }}
  onMouseOver={(e) => {
    e.target.style.backgroundColor = "#1c68e8";
    e.target.style.transform = "translateY(-2px)";
    e.target.style.boxShadow = "0 6px 12px rgba(41, 121, 255, 0.4)";
  }}
  onMouseOut={(e) => {
    e.target.style.backgroundColor = "#2979ff";
    e.target.style.transform = "translateY(0)";
    e.target.style.boxShadow = "0 4px 8px rgba(41, 121, 255, 0.3)";
  }}
>
  Télécharger en PDF
</button>
      )}
    </div>
  );
}
