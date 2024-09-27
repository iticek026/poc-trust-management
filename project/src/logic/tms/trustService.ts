import { Interaction } from "../common/interaction";
import { DirectTrust } from "./trust/directTrust";
import { IndirectTrust } from "./trust/indirectTrust";
import { calculateTrust } from "./trust/utils";
import { ContextInformation } from "./trust/contextInformation";
import { TrustRecord } from "./trustRecord";
import { Authority, AuthorityInstance } from "./actors/authority";
import { LeaderRobot } from "./actors/leaderRobot";
import { Robot } from "../robot/robot";
import { Context, createContextData } from "../../utils/utils";
import { EntityCacheInstance } from "../../utils/cache";

export class TrustService {
  private trustHistory: Map<number, TrustRecord>;
  private robotId: number;
  private authority: Authority;
  private leader: LeaderRobot | null;
  private robot: Robot;

  constructor(robot: Robot, authority: Authority, leader: LeaderRobot | null) {
    this.trustHistory = new Map();
    this.robotId = robot.getId();
    this.authority = authority;
    this.leader = leader;
    this.robot = robot;
  }

  calculateTrust(peerId: number, context: any): number {
    let trustRecord = this.trustHistory.get(peerId);
    if (!trustRecord) {
      trustRecord = new TrustRecord();
      this.trustHistory.set(peerId, trustRecord);
    }
    const directTrust = new DirectTrust().calculate(
      trustRecord,
      this.getAllInteractions(),
      new ContextInformation(context),
    );
    const indirectTrust = new IndirectTrust(this.authority, this.leader).calculate(peerId);
    return calculateTrust(directTrust, indirectTrust);
  }

  private getAllInteractions(): Interaction[] {
    const interactions: Interaction[] = [];
    this.trustHistory.forEach((trustRecord) => {
      interactions.push(...trustRecord.interactions);
    });
    return interactions;
  }

  public makeTrustDecision(peerId: number, context: Context): boolean {
    // TODO log interaction here

    // TODO do checks for every received and rexpected value type

    const interaction = new Interaction({
      fromRobotId: this.robotId,
      toRobotId: peerId,
      outcome: true,
      context: new ContextInformation(context),
      receivedValue: context?.payload as any,
      expectedValue: EntityCacheInstance.getRobotById(peerId)?.getPosition(),
    });

    const trustLevel = this.addInteractionAndUpdateTrust(interaction);

    const contextThreshold = new ContextInformation(context).getThreshold();

    return trustLevel >= contextThreshold;
  }

  public addInteractionAndUpdateTrust(interaction: Interaction): number {
    const peerId = interaction.toRobotId === this.robotId ? interaction.fromRobotId : interaction.toRobotId;
    let trustRecord = this.trustHistory.get(peerId);

    if (!trustRecord) {
      trustRecord = new TrustRecord();
      this.trustHistory.set(peerId, trustRecord);
    }

    trustRecord.addInteraction(interaction);

    const trust = this.calculateTrust(peerId, interaction.context);
    AuthorityInstance.receiveTrustUpdate(this.robotId, peerId, trust);

    trustRecord.calculateTrustLevel(trust);

    return trust;
  }

  public getTrustRecord(peerId: number): TrustRecord | undefined {
    return this.trustHistory.get(peerId);
  }

  getMemberHistory(): { id: number; label: string; history: Map<number, TrustRecord> } {
    return { id: this.robotId, history: this.trustHistory, label: this.robot.getLabel() as string };
  }
}
