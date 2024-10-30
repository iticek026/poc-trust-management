import { EntityCacheInstance } from "../../utils/cache";
import { Authority } from "./actors/authority";
import { RobotType } from "./actors/interface";
import { MemberHistory, TrustService } from "./trustService";

type TrustData = {
  id: number;
  label: string;
  trustProperties: TrustProperties[];
  type: RobotType | "authority";
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

  getTrustHistories(): MemberHistory[] {
    const histories = this.trustServices.map((trustService) => trustService.getMemberHistory());
    return histories;
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
      trustData.push({ id: 0, label: "Authority", trustProperties: authorityTrust, type: "authority" });
    }

    const histories = this.getTrustHistories();

    return trustData.concat(
      histories.map((history) => {
        const id = history.id;
        const robot = EntityCacheInstance.getRobotById(id);

        const trustProperties: TrustProperties[] = Array.from(history.history.entries())
          .map(([key, value]) => {
            if (typeof key === "string") {
              return;
            }

            const robot = EntityCacheInstance.getRobotById(key);
            return {
              trustTo: { id: key, label: robot?.getLabel() as string },
              trustValue: value.currentTrustLevel,
            };
          })
          .filter((value) => value !== undefined);

        return { id, trustProperties, label: history.label, type: robot?.getRobotType() ?? "unknown" };
      }),
    );
  }

  clearTrustData(): void {
    this.trustServices = [];
  }
}
