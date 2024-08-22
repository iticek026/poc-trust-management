import { useEffect, useRef, useState } from "react";
import { Simulation } from "../logic/simulation/simulation";
import { Environment } from "../logic/environment/environment";
import { RobotSwarm } from "../logic/robot/swarm";
import { EnvironmentObject } from "../logic/environment/environmentObject";
import robots from "../mockData/robots";

const envObj = {} as EnvironmentObject;
const environment = new Environment(envObj, envObj, 1000, 1200);
const swarm = new RobotSwarm(robots);

export const Canvas: React.FC = () => {
  const simulationRef = useRef<HTMLDivElement>(null);
  const [simulation] = useState(() => new Simulation(environment, swarm));

  useEffect(() => {
    const { stop } = simulation.start(simulationRef.current);

    return () => stop();
  }, [simulation]);

  return <div ref={simulationRef} style={{ width: "100%", height: "100%" }} />;
};
