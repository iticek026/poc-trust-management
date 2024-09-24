import {
  EnvironmentConfig,
  EnvironmentObjectConfig,
  RobotConfig,
  SimulationConfig,
} from "../logic/simulation/simulationConfigParser";

const robotsConfig: RobotConfig[] = [
  { coordinates: { x: 500, y: 800 }, isLeader: true },
  { coordinates: { x: 600, y: 600 } },
  { coordinates: { x: 800, y: 300 } },
  { coordinates: { x: 800, y: 600 } },
];

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
  obstacles: [
    {
      height: 90,
      width: 90,
      coordinates: { x: 550, y: 700 },
    },
    {
      height: 90,
      width: 90,
      coordinates: { x: 300, y: 700 },
    },
    {
      height: 90,
      width: 90,
      coordinates: { x: 700, y: 300 },
    },
    {
      height: 90,
      width: 90,
      coordinates: { x: 700, y: 550 },
    },
  ],
  height: 1700,
  width: 1200,
};

const simulationConfig: SimulationConfig = {
  robots: robotsConfig,
  environment: environmentConfig,
};

export default simulationConfig;
