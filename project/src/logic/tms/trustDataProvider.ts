import { EntityCacheInstance } from "../../utils/cache";
import { TrustService } from "./trustService";

export class TrustDataProvider {
  private trustServices: TrustService[] = [];

  public addTrustService(trustService: TrustService): void {
    this.trustServices.push(trustService);
  }

  getTrustData(): {
    id: number;
    label: string;
    trustProperties: { trustTo: { id: number; label: string }; trustValue: number }[];
  }[] {
    const histories = this.trustServices.map((trustService) => trustService.getMemberHistory());

    const res: {
      id: number;
      label: string;
      trustProperties: { trustTo: { id: number; label: string }; trustValue: number }[];
    }[] = histories.map((history) => {
      const id = history.id;
      const trustProperties: { trustTo: { id: number; label: string }; trustValue: number }[] = Array.from(
        history.history.entries(),
      ).map(([key, value]) => {
        return {
          trustTo: { id: key, label: EntityCacheInstance.getRobotById(key)?.getLabel() as string },
          trustValue: value.currentTrustLevel,
        };
      });
      return { id, trustProperties, label: history.label };
    });

    return res;
  }

  clearTrustData(): void {
    this.trustServices = [];
  }
}
