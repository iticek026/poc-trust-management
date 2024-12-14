import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SimulationConfigProvider } from "./context/simulationConfig.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <SimulationConfigProvider>
    <App />
  </SimulationConfigProvider>,
);
