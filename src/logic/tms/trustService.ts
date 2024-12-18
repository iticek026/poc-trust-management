import { Interaction } from "../common/interaction";
import { DirectTrust, DirectTrustCalculationData } from "./trust/directTrust";
import { IndirectTrust, IndirectTrustCalculationData } from "./trust/indirectTrust";
import { calculateTrust } from "./trust/utils";
import { ContextInformation } from "./trust/contextInformation";
import { TrustRecord, TrustRecordInterface } from "./trustRecord";
import { Authority } from "./actors/authority";
import { LeaderRobot } from "./actors/leaderRobot";
import { Context } from "../../utils/utils";
import { EntityCacheInstance } from "../../utils/cache";
import { Logger } from "../logger/logger";
import { TrustRobot } from "./actors/trustRobot";
import { ConstantsInstance } from "./consts";

export type MemberHistory = {
  id: number;
  label: string;
  history: Map<number | string, TrustRecordInterface>;
};

export type Trust = {
  value: number;
  directTrust: DirectTrustCalculationData;
  indirectTrust: IndirectTrustCalculationData;
  contextInformation: { context: ContextInformation; value: number };
};

export class TrustService {
  private trustHistory: Map<number | string, TrustRecord>;
  private robotId: number;
  private authority: Authority;
  private leader: LeaderRobot | null;
  private robot: TrustRobot;
  private trustedPeers: Set<number> = new Set();

  constructor(robot: TrustRobot, authority: Authority, leader: LeaderRobot | null) {
    this.trustHistory = new Map();
    this.robotId = robot.getId();
    this.authority = authority;
    this.leader = leader;
    this.robot = robot;
  }

  getOwner(): TrustRobot {
    return this.robot;
  }

  private calculateTrust(peerId: number, context: ContextInformation): Trust {
    let trustRecord = this.trustHistory.get(peerId);
    if (!trustRecord) {
      trustRecord = new TrustRecord();
      this.trustHistory.set(peerId, trustRecord);
    }
    const directTrust = DirectTrust.calculate(trustRecord, new ContextInformation(context));
    const otherPeers = Array.from(EntityCacheInstance.getCache("robots").keys())
      .filter((id) => id !== this.robotId)
      .filter((id) => !this.trustedPeers.has(id))
      .map((id) => id);

    const indirectTrust = IndirectTrust.calculate(
      peerId,
      this.trustedPeers,
      new Set(otherPeers),
      this.authority,
      this.leader,
    );
    return {
      value: calculateTrust(directTrust, indirectTrust),
      directTrust: directTrust,
      indirectTrust: indirectTrust,
      contextInformation: { context, value: context.getThreshold() },
    };
  }

  public makeTrustDecision(peerId: number, context: Context, updateTrust: boolean): boolean {
    if (!ConstantsInstance.isTrustActive) {
      return true;
    }

    const interaction = new Interaction({
      fromRobotId: this.robotId,
      toRobotId: peerId,
      outcome: null,
      context: new ContextInformation(context),
    });

    const trustLevel = this.addInteractionAndUpdateTrust(interaction, updateTrust);

    const contextInformation = new ContextInformation(context);
    const contextThreshold = contextInformation.getThreshold();

    Logger.info(`Robot ${this.robot.getLabel()} make trust decision:`, {
      peer: EntityCacheInstance.getRobotById(peerId)?.getLabel(),
      trustLevel,
      contextThreshold,
      contextInformation: contextInformation.getContextInformation(),
      outcome: trustLevel >= contextThreshold,
    });

    return trustLevel >= contextThreshold;
  }

  public addInteractionAndUpdateTrust(interaction: Interaction, updateTrust: boolean = true): number {
    const peerId = interaction.toRobotId === this.robotId ? interaction.fromRobotId : interaction.toRobotId;

    if (typeof peerId === "string") {
      return -1;
    }

    const trust = this.addInteractionAndUpdateLocalTrust(interaction, updateTrust);

    if (updateTrust) {
      this.reportToAuthority(peerId, trust);
    }

    return trust;
  }

  public reportToAuthority(peerId: number, trust: number) {
    this.authority.receiveTrustUpdate(this.robotId, peerId, trust);
  }

  public getReputationFromAuthority(robotId: number) {
    return this.authority.getReputation(robotId);
  }

  public getActiveRobotFromAuthority() {
    return this.authority.getActiveRobots();
  }

  public addInteractionAndUpdateLocalTrust(interaction: Interaction, updateTrust: boolean = true): number {
    const peerId = interaction.toRobotId === this.robotId ? interaction.fromRobotId : interaction.toRobotId;
    let trustRecord = this.trustHistory.get(peerId);

    if (!trustRecord) {
      trustRecord = new TrustRecord();
      this.trustHistory.set(peerId, trustRecord);
    }

    if (updateTrust) {
      trustRecord.addInteraction(interaction);
    }

    if (typeof peerId === "string") {
      return -1;
    }

    const trust = this.calculateTrust(peerId, interaction.context);

    interaction.trustScore = trust.value;
    interaction.directTrust = trust.directTrust.value;
    interaction.indirectTrust = trust.indirectTrust.value;

    if (updateTrust) {
      const trustBeforeUpdate = trustRecord.trustScore;

      trustRecord.updateTrust(trust.value);
      trustRecord.updateAnalyticsData(trust, this.robot.isPartOfTransporting());

      Logger.info(`Trust update:`, {
        from: this.robot.getLabel(),
        to: EntityCacheInstance.getRobotById(peerId)?.getLabel(),
        trustBeforeUpdate,
        trustAfterUpdate: trustRecord.trustScore,
        interaction: interaction,
      });
    }

    if (trustRecord.trustScore > 0.75) {
      this.trustedPeers.add(peerId);
    }

    if (trustRecord.trustScore <= 0.75 && this.trustedPeers.has(peerId)) {
      this.trustedPeers.delete(peerId);
    }

    return trust.value;
  }

  public getTrustRecord(peerId: number): TrustRecord | undefined {
    return this.trustHistory.get(peerId);
  }

  getTrustHistory(): Map<number | string, TrustRecord> {
    return this.trustHistory;
  }

  getMemberHistory(): MemberHistory {
    return { id: this.robotId, history: this.trustHistory, label: this.robot.getLabel() as string };
  }

  setHistoryForPeer(peerId: number | string, record: TrustRecord) {
    this.trustHistory.set(peerId, record);
  }
}
