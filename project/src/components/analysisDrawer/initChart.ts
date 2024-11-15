import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
  Title,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
  Title,
  annotationPlugin,
);
