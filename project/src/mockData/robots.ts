import { Environment } from "../logic/environment/environment";
import {
  RobotConfig,
  SimulationConfig,
} from "../logic/simulation/simulationConfigParser";

const robotsConfig = [
  { coordinates: { x: 0, y: 0 } },
  { coordinates: { x: 600, y: 600 } },
  // { coordinates: { x: 0, y: 0 } },
  // { coordinates: { x: 0, y: 0 } },
  // { coordinates: { x: 0, y: 0 } },
  // { coordinates: { x: 0, y: 0 } },
] as RobotConfig[];

const environmentConfig = {
  goal: {},
  base: {},
  height: 1000,
  width: 1200,
} as Environment;

const simulationConfig: SimulationConfig = {
  robots: robotsConfig,
  environment: environmentConfig,
};

export default simulationConfig;
