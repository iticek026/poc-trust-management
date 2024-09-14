import { Trust } from "../trust";

export class DirectTrust extends Trust {
  public calculate(peerId: number): number {
    // Calculate based on direct interactions
    // Placeholder logic
    return this.value;
  }
}
