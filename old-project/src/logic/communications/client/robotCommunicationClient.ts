export class RobotCommunicationClient {
  private factory: CommunicationFactory;
  constructor(factory: CommunicationFactory) {
    this.factory = factory;
  }

  useCA() {
    this.factory.getCACCommunication();
  }

  useP2P() {
    this.factory.getP2PCommunication();
  }
}
