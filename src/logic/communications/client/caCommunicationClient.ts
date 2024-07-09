import { CommunicationFactory } from "../interfaces";

export class CACommunicationClient {
  private factory: CommunicationFactory;
  constructor(factory: CommunicationFactory) {
    this.factory = factory;
  }

  useCA() {
    this.factory.getCACCommunication();
  }
}
