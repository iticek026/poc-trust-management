import { TrustService } from "./trustService";

export class TrustDataProvider {
  private trustServices: TrustService[] = [];

  public addTrustService(trustService: TrustService): void {
    this.trustServices.push(trustService);
  }

  getTrustData(): { id: number; trust: number } {
    const histories = this.trustServices.map((trustService) => trustService.getMemberHistory());
    const trustData = histories[0];
    const ids = Array.from(trustData.keys());
    const trustValues = Array.from(trustData.values());

    if (ids.length === 0 || trustValues.length === 0) {
      return { id: -1, trust: 0 };
    }
    return { id: ids[0], trust: trustValues[0].currentTrustLevel };
  }
}
