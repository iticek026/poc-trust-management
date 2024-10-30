import { environmentBuilder, swarmBuilder, trustInitialization } from "../logic/simulation/simulationConfigParser";
import { simulationConfig } from "./mocks/simulationConfig/simulationConfig";
import { Engine } from "matter-js";
import { TrustDataProvider } from "../logic/tms/trustDataProvider";
import { isConfigOfMaliciousRobot } from "../logic/simulation/utils";
import { ConstantsInstance } from "../logic/tms/consts";
import { EntityCacheInstance } from "../utils/cache";
import { convertSimulationTrustResultWithConfig } from "../logic/jsonConfig/configConverter";
import { Environment } from "../logic/environment/environment";
import { RobotSwarm } from "../logic/robot/swarm";
import { memberHistories } from "./mocks/simulationConfig/simulationOutputCongif";

describe("SimulationOutputJson", () => {
  const engine = {} as Engine;

  let environment: Environment;
  let trustDataProvider: TrustDataProvider;
  let swarm: RobotSwarm;

  beforeEach(() => {
    ConstantsInstance.setUp({
      ...simulationConfig.trust,
      CELL_SIZE: 30,
      ...simulationConfig.authority,
      ...simulationConfig.robotGeneral,
    });
    environment = environmentBuilder(simulationConfig.environment);
    trustDataProvider = new TrustDataProvider();
    swarm = swarmBuilder(simulationConfig.robots, engine, environment, trustDataProvider);
  });

  test("simulation output to simulation config", () => {
    const config = convertSimulationTrustResultWithConfig(simulationConfig, memberHistories, swarm);

    expect(config).toEqual(simulationConfig);
  });

  test("trust initialization", () => {
    EntityCacheInstance.createCache(swarm.robots, "robots");

    trustInitialization(swarm, simulationConfig.robots);

    swarm.robots.forEach((robot) => {
      const trustHistory = robot.getTrustService().getTrustHistory();
      const config = simulationConfig.robots.find((configRobot) => configRobot.label === robot.getLabel());

      const expectedSize = isConfigOfMaliciousRobot(config!)
        ? 0
        : (Object.keys(config?.trustHistory ?? {}).length ?? 0);
      expect(trustHistory.size).toBe(expectedSize);
    });
  });
});
