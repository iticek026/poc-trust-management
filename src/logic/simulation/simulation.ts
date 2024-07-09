import { Environment } from "@/logic/environment/environment";
import { RobotSwarm } from "@/logic/robot/swarm";

export class Simulation {
  environment: Environment;
  swarm: RobotSwarm;
  constructor(environment: Environment, swarm: RobotSwarm) {
    this.environment = environment;
    this.swarm = swarm;
  }
}
