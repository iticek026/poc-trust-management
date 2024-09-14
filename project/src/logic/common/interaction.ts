import { ContextInformation } from "../tms/trust/contextInformation";

export class Interaction {
  public fromRobotId: number;
  public toRobotId: number;
  public outcome: boolean;
  public timestamp: Date;
  public context: ContextInformation;

  constructor(fromRobotId: number, toRobotId: number, outcome: boolean, context: ContextInformation) {
    this.fromRobotId = fromRobotId;
    this.toRobotId = toRobotId;
    this.outcome = outcome;
    this.timestamp = new Date();
    this.context = context;
  }
}
