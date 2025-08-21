import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function MyQrCode() {
  const [qrUrl, setQrUrl] = useState("");
  const qrRef = useRef(null);

  useEffect(() => {
    const fetchQr = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return;

        // Demande au backend de renvoyer le QR (basé sur le qrToken stocké)
        const res = await axios.get(`http://localhost:3000/api/auth/qr/${user.id}`);
        setQrUrl(res.data.qr);
      } catch (err) {
        console.error("Erreur récupération QR:", err);
      }
    };

    fetchQr();
  }, []);

  const handleDownloadPDF = async () => {
    if (!qrRef.current) return;

    const canvas = await html2canvas(qrRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 20, pdfWidth, pdfHeight);
    pdf.save("MonQRCode.pdf");
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
