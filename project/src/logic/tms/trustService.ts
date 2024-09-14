import { Interaction } from "../common/interaction";
import { DirectTrust } from "./trust/directTrust";
import { IndirectTrust } from "./trust/indirectTrust";
import { calculateTrust } from "./trust/utils";
import { ContextInformation } from "./trust/contextInformation";
import { TrustRecord } from "./trustRecord";

export class TrustService {
  private trustHistory: Map<number, TrustRecord>;
  private robotId: number;

  constructor(robotId: number) {
    this.trustHistory = new Map();
    this.robotId = robotId;
  }

  public makeTrustDecision(peerId: number, context: any): boolean {
    const directTrust = new DirectTrust().calculate(peerId);
    const indirectTrust = new IndirectTrust().calculate(peerId);
    const trustLevel = calculateTrust(directTrust, indirectTrust);

    const contextThreshold = new ContextInformation(context).getThreshold();

    return trustLevel >= contextThreshold;
  }

  public updateTrust(interaction: Interaction): void {
    const peerId = interaction.toRobotId === this.robotId ? interaction.fromRobotId : interaction.toRobotId;
    let trustRecord = this.trustHistory.get(peerId);

    if (!trustRecord) {
      trustRecord = new TrustRecord();
      this.trustHistory.set(peerId, trustRecord);
    }

    trustRecord.addInteraction(interaction);
  }

  public getTrustRecord(peerId: number): TrustRecord | undefined {
    return this.trustHistory.get(peerId);
  }
}
