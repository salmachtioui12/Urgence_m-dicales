import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MyQrCode() {
  const [qrUrl, setQrUrl] = useState("");

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

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Mon QR Code</h2>
      <p>Scannez ce code pour vous connecter rapidement.</p>
      {qrUrl ? (
        <img src={qrUrl} alt="QR Code de connexion" style={{ width: 250 }} />
      ) : (
        <p>Chargement...</p>
      )}
    </div>
  );
}
