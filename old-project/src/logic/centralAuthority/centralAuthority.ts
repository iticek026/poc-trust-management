import { CACommunicationClient } from "@/logic/communications/client/caCommunicationClient";
import { CaCommunicationFactory } from "@/logic/communications/factory/caCommunicationFactory";
import { RobotSwarm } from "@/logic/robot/swarm";
import { TrustManagementSystem } from "@/logic/tms/trustManagement";
import { AllRobotsHistory } from "./interfaces";

export class CentralAuthority {
  communication: CACommunicationClient;
  swarm: RobotSwarm;
  tms: TrustManagementSystem;
  allRobotsHistory: AllRobotsHistory = {};

  constructor(tms: TrustManagementSystem, swarm: RobotSwarm) {
    this.communication = new CACommunicationClient(
      new CaCommunicationFactory()
    );

    this.swarm = swarm;
    this.tms = tms;
  }
}
