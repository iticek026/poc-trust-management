import { Chart as ChartJS, registerables } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(...registerables, annotationPlugin);
