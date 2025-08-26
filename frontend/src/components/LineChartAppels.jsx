// Import du composant Line pour créer des graphiques en courbes depuis react-chartjs-2
import { Line } from 'react-chartjs-2';

// Import des modules nécessaires de Chart.js
import {
  Chart as ChartJS,       // Objet principal Chart.js
  CategoryScale,          // Pour l’axe des catégories (axe X)
  LinearScale,            // Pour l’axe linéaire (axe Y)
  PointElement,           // Pour afficher les points sur la courbe
  LineElement,            // Pour tracer la ligne de la courbe
  Tooltip,                // Pour afficher les infobulles
  Legend,                 // Pour afficher la légende du graphique
} from 'chart.js';

// Enregistrement des composants nécessaires dans Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

// Composant React pour afficher un graphique en ligne des appels d'urgence
export default function LineChartAppels({ data }) {
  // Préparation des données pour le graphique
  const chartData = {
    // Les labels de l’axe X (heures des appels)
    labels: data.map(item => item.heure),

    // Dataset du graphique
    datasets: [
      {
        label: 'Urgences par heure',                // Nom de la série
        data: data.map(item => item.total),        // Données pour l’axe Y
        borderColor: 'rgba(75,192,192,1)',         // Couleur de la ligne
        backgroundColor: 'rgba(75,192,192,0.2)',  // Couleur sous la ligne (zone remplie)
        fill: true,                                // Remplir la zone sous la ligne
        tension: 0.3,                              // Courbe légèrement arrondie
      }
    ]
  };

  // Options de configuration du graphique
  const options = {
    responsive: true,       // Graphique responsive
    plugins: {
      legend: {
        position: 'bottom'  // Position de la légende en bas
      }
    }
  };

  // Rendu du graphique dans un conteneur
  return (
    <div style={{ height: '300px' }}>  {/* Conteneur avec hauteur fixe */}
      <Line data={chartData} options={options} /> {/* Composant Line pour afficher le graphique */}
    </div>
  );
}
