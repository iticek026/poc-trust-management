import {
  EnvironmentConfig,
  EnvironmentObjectConfig,
  RobotConfig,
  SimulationConfig,
} from "../logic/simulation/simulationConfigParser";

const robotsConfig = [
  { coordinates: { x: 500, y: 800 } },
  // { coordinates: { x: 600, y: 600 } },
  // { coordinates: { x: 0, y: 0 } },
  // { coordinates: { x: 0, y: 0 } },
  // { coordinates: { x: 0, y: 0 } },
  // { coordinates: { x: 0, y: 0 } },
] as RobotConfig[];

const environmentConfig: EnvironmentConfig = {
  searchedObject: {
    height: 100,
    width: 100,
    coordinates: { x: 300, y: 300 },
  } as EnvironmentObjectConfig,
  base: {
    height: 400,
    width: 400,
    coordinates: { x: 1100, y: 1000 },
  } as EnvironmentObjectConfig,
  height: 1000,
  width: 1200,
};

const simulationConfig: SimulationConfig = {
  robots: robotsConfig,
  environment: environmentConfig,
};

export default simulationConfig;
