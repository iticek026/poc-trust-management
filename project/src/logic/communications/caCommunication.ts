import { Communication } from "./interfaces";

export class CACCommunication implements Communication {
  send(message: string): void {
    throw new Error("Method not implemented.");
  }

  receive(): string {
    throw new Error("Method not implemented.");
  }
}
