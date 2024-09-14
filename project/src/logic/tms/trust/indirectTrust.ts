import { Trust } from "../trust";

export class IndirectTrust extends Trust {
  public calculate(peerId: number): number {
    // Calculate based on indirect information
    // Placeholder logic
    return this.value;
  }
}
