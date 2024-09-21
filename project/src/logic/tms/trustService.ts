import { Interaction } from "../common/interaction";
import { DirectTrust } from "./trust/directTrust";
import { IndirectTrust } from "./trust/indirectTrust";
import { calculateTrust } from "./trust/utils";
import { ContextInformation } from "./trust/contextInformation";
import { TrustRecord } from "./trustRecord";
import { Authority } from "./actors/authority";
import { LeaderRobot } from "./actors/leaderRobot";

export class TrustService {
  private trustHistory: Map<number, TrustRecord>;
  private robotId: number;
  private authority: Authority;
  private leader: LeaderRobot | null;

  constructor(robotId: number, authority: Authority, leader: LeaderRobot | null) {
    this.trustHistory = new Map();
    this.robotId = robotId;
    this.authority = authority;
    this.leader = leader;
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

  public makeTrustDecision(peerId: number, context: any): boolean {
    // TODO log interaction here
    // TODO add outcome trust score to interaction

    const trustLevel = this.calculateTrust(peerId, context);

    const contextThreshold = new ContextInformation(context).getThreshold();

    return trustLevel >= contextThreshold;
  }

  public addInteractionAndUpdateTrust(interaction: Interaction): void {
    const peerId = interaction.toRobotId === this.robotId ? interaction.fromRobotId : interaction.toRobotId;
    let trustRecord = this.trustHistory.get(peerId);

    if (!trustRecord) {
      trustRecord = new TrustRecord();
      this.trustHistory.set(peerId, trustRecord);
    }

    trustRecord.addInteraction(interaction);

    const trust = this.calculateTrust(peerId, interaction.context);

    // const directTrust = new DirectTrust().calculate(
    //   trustRecord,
    //   this.getAllInteractions(),
    //   new ContextInformation(interaction.context),
    // );

    trustRecord.calculateTrustLevel(trust);
  }

  public getTrustRecord(peerId: number): TrustRecord | undefined {
    return this.trustHistory.get(peerId);
  }
}
