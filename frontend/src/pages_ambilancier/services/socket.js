import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  autoConnect: true,
  withCredentials: true,
});

socket.on("connect", () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const userId = decoded.id || decoded._id;  // selon la clé dans ton token
      if (userId) {
        socket.send(JSON.stringify({ type: "REGISTER", userId }));
        console.log("🔐 REGISTER envoyé avec userId:", userId);
      } else {
        console.warn("⚠️ userId introuvable dans le token décodé");
      }
    } catch (err) {
      console.error("Erreur décodage token JWT :", err);
    }
  } else {
    console.warn("⚠️ Aucun token trouvé dans localStorage");
  }
});

export default socket;
