import { CACCommunication } from "./caCommunication";
import { P2PCommunication } from "./p2pCommunication";

export interface CommunicationFactory {
  getP2PCommunication(): P2PCommunication;
  getCACCommunication(): CACCommunication;
}

export interface Communication {
  send(message: string): void;
  receive(): string;
}
