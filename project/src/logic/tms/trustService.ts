import { Interaction } from "../common/interaction";
import { DirectTrust } from "./trust/directTrust";
import { IndirectTrust } from "./trust/indirectTrust";
import { calculateTrust } from "./trust/utils";
import { ContextInformation } from "./trust/contextInformation";
import { TrustRecord } from "./trustRecord";
import { Authority, AuthorityInstance } from "./actors/authority";
import { LeaderRobot } from "./actors/leaderRobot";
import { Robot } from "../robot/robot";
import { Context } from "../../utils/utils";
import { EntityCacheInstance } from "../../utils/cache";

export class TrustService {
  private trustHistory: Map<number, TrustRecord>;
  private robotId: number;
  private authority: Authority;
  private leader: LeaderRobot | null;
  private robot: Robot;
  private trustedPeers: Set<number> = new Set();

  constructor(robot: Robot, authority: Authority, leader: LeaderRobot | null) {
    this.trustHistory = new Map();
    this.robotId = robot.getId();
    this.authority = authority;
    this.leader = leader;
    this.robot = robot;
  }

  private calculateTrust(peerId: number, context: any): number {
    let trustRecord = this.trustHistory.get(peerId);
    if (!trustRecord) {
      trustRecord = new TrustRecord(new Date());
      this.trustHistory.set(peerId, trustRecord);
    }
    const directTrust = new DirectTrust().calculate(
      trustRecord,
      this.getAllInteractions(),
      new ContextInformation(context),
    );
    const otherPeers = Array.from(EntityCacheInstance.getCache("robots").keys())
      .filter((id) => id !== this.robotId)
      .filter((id) => !this.trustedPeers.has(id))
      .map((id) => id);

    const indirectTrust = new IndirectTrust(
      this.authority,
      this.leader,
      this.trustedPeers,
      new Set(otherPeers),
    ).calculate(peerId);

    return calculateTrust(directTrust, indirectTrust);
  }

  private getAllInteractions(): Interaction[] {
    const interactions: Interaction[] = [];
    this.trustHistory.forEach((trustRecord) => {
      interactions.push(...trustRecord.interactions);
    });
    return interactions;
  }

  public makeTrustDecision(peerId: number, context: Context, updateTrust: boolean): boolean {
    const interaction = new Interaction({
      fromRobotId: this.robotId,
      toRobotId: peerId,
      outcome: null,
      context: new ContextInformation(context),
    });

    const trustLevel = this.addInteractionAndUpdateTrust(interaction, updateTrust);

    const contextThreshold = new ContextInformation(context).getThreshold();

    return trustLevel >= contextThreshold;
  }

  public addInteractionAndUpdateTrust(interaction: Interaction, updateTrust: boolean = true): number {
    const peerId = interaction.toRobotId === this.robotId ? interaction.fromRobotId : interaction.toRobotId;
    let trustRecord = this.trustHistory.get(peerId);

    if (!trustRecord) {
      trustRecord = new TrustRecord(new Date());
      this.trustHistory.set(peerId, trustRecord);
    }

    if (updateTrust) {
      trustRecord.addInteraction(interaction);
    }

    const trust = this.calculateTrust(peerId, interaction.context);

    if (updateTrust) {
      AuthorityInstance.receiveTrustUpdate(this.robotId, peerId, trust);

      trustRecord.calculateTrustLevel(trust);
    }

    if (trustRecord.currentTrustLevel > 0.75) {
      this.trustedPeers.add(peerId);
    }

    if (trustRecord.currentTrustLevel <= 0.75 && this.trustedPeers.has(peerId)) {
      this.trustedPeers.delete(peerId);
    }

    return trust;
  }

  public getTrustRecord(peerId: number): TrustRecord | undefined {
    return this.trustHistory.get(peerId);
  }

  getTrustHistory(): Map<number, TrustRecord> {
    return this.trustHistory;
  }

  getMemberHistory(): { id: number; label: string; history: Map<number, TrustRecord> } {
    return { id: this.robotId, history: this.trustHistory, label: this.robot.getLabel() as string };
  }
}
