import { CACommunicationClient } from "../communications/client/caCommunicationClient";
import { CaCommunicationFactory } from "../communications/factory/caCommunicationFactory";
import { RobotSwarm } from "../robot/swarm";
import { TrustManagementSystem } from "../tms/trustManagement";
import { AllRobotsHistory } from "../common/interfaces/robotHistory";

export class CentralAuthority {
  communication: CACommunicationClient;
  swarm: RobotSwarm;
  tms: TrustManagementSystem;
  allRobotsHistory: AllRobotsHistory = {};

  constructor(tms: TrustManagementSystem, swarm: RobotSwarm) {
    this.communication = new CACommunicationClient(new CaCommunicationFactory());

    this.swarm = swarm;
    this.tms = tms;
  }
}
