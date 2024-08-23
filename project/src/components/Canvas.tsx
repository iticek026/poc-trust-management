import { useEffect, useRef, useState } from "react";
import { Simulation } from "../logic/simulation/simulation";
import simulationConfig from "../mockData/robots";

export const Canvas: React.FC = () => {
  const simulationRef = useRef<HTMLDivElement>(null);
  const [simulation] = useState(() => new Simulation(simulationConfig));

  useEffect(() => {
    const { stop } = simulation.start(simulationRef.current);

    return () => stop();
  }, [simulation]);

  return <div ref={simulationRef} style={{ width: "100%", height: "100%" }} />;
};
