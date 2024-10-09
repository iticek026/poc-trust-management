import { EntityCacheInstance } from "../../utils/cache";
import { Authority } from "./actors/authority";
import { TrustService } from "./trustService";

type TrustData = {
  id: number;
  label: string;
  trustProperties: TrustProperties[];
  isMalicious: boolean;
};

type TrustProperties = { trustTo: { id: number; label: string }; trustValue: number };

export class TrustDataProvider {
  private trustServices: TrustService[] = [];
  private authority?: Authority;

  public addTrustService(trustService: TrustService): void {
    this.trustServices.push(trustService);
  }

  addAuthority(authority: Authority): void {
    this.authority = authority;
  }

  getTrustData(): TrustData[] {
    const trustData: TrustData[] = [];

    if (this.authority) {
      const authorityTrust: TrustProperties[] = Array.from(this.authority.getRobotReputations().entries()).map(
        ([key, reputation]) => {
          const robot = EntityCacheInstance.getRobotById(key);

          return {
            trustTo: {
              id: key,
              label: robot?.getLabel() as string,
            },
            trustValue: reputation.reputationScore,
          };
        },
      );
      trustData.push({ id: 0, label: "Authority", trustProperties: authorityTrust, isMalicious: false });
    }

    const histories = this.trustServices.map((trustService) => trustService.getMemberHistory());

    return trustData.concat(
      histories.map((history) => {
        const id = history.id;
        const robot = EntityCacheInstance.getRobotById(id);

        const trustProperties: TrustProperties[] = Array.from(history.history.entries()).map(([key, value]) => {
          const robot = EntityCacheInstance.getRobotById(key);
          return {
            trustTo: { id: key, label: robot?.getLabel() as string },
            trustValue: value.currentTrustLevel,
          };
        });

        const isMalicious = robot?.getRobotType() === "malicious";
        return { id, trustProperties, label: history.label, isMalicious };
      }),
    );
  }

  clearTrustData(): void {
    this.trustServices = [];
  }
}
