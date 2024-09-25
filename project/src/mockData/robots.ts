import {
  EnvironmentConfig,
  EnvironmentObjectConfig,
  RobotConfig,
  SimulationConfig,
} from "../logic/simulation/simulationConfigParser";

const robotsConfig: RobotConfig[] = [
  { label: "Coco CH", coordinates: { x: 500, y: 800 }, isLeader: true },
  { label: "Sea", coordinates: { x: 800, y: 800 } },
  { label: "Pika", coordinates: { x: 600, y: 600 } },
  { label: "Cobra", coordinates: { x: 800, y: 300 } },
  // { id: 9, coordinates: { x: 800, y: 600 } },
  // { id: 4, coordinates: { x: 600, y: 600 } },
  // { id: 5, coordinates: { x: 800, y: 300 } },
  // { id: 6, coordinates: { x: 800, y: 600 } },
  // { id: 7, coordinates: { x: 600, y: 600 } },
  // { id: 8, coordinates: { x: 800, y: 300 } },
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
