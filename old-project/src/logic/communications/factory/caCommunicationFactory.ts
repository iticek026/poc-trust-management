export class CaCommunicationFactory implements CommunicationFactory {
  getP2PCommunication(): P2PCommunication {
    throw new Error("Method not implemented.");
  }

  getCACCommunication(): CACCommunication {
    throw new Error("Method not implemented.");
  }
}
