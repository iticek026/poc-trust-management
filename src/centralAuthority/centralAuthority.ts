class CentralAuthority {
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
