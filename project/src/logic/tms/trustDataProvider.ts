import { EntityCacheInstance } from "../../utils/cache";
import { Authority } from "./actors/authority";
import { TrustService } from "./trustService";

export class TrustDataProvider {
  private trustServices: TrustService[] = [];
  private authority?: Authority;

  public addTrustService(trustService: TrustService): void {
    this.trustServices.push(trustService);
  }

  addAuthority(authority: Authority): void {
    this.authority = authority;
  }

  getTrustData(): {
    id: number;
    label: string;
    trustProperties: { trustTo: { id: number; label: string }; trustValue: number }[];
  }[] {
    const trustData: {
      id: number;
      label: string;
      trustProperties: { trustTo: { id: number; label: string }; trustValue: number }[];
    }[] = [];

    if (this.authority) {
      const authorityTrust = Array.from(this.authority.getRobotReputations().entries()).map(([key, reputation]) => ({
        trustTo: {
          id: key,
          label: EntityCacheInstance.getRobotById(key)?.getLabel() as string,
        },
        trustValue: reputation.reputationScore,
      }));
      trustData.push({ id: 0, label: "Authority", trustProperties: authorityTrust });
    }

    const histories = this.trustServices.map((trustService) => trustService.getMemberHistory());

    return trustData.concat(
      histories.map((history) => {
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
      }),
    );
  }

  clearTrustData(): void {
    this.trustServices = [];
  }
}
