import { ContextInformation } from "../tms/trust/contextInformation";

export class Interaction {
  public fromRobotId: number;
  public toRobotId: number;
  public outcome: boolean;
  public timestamp: Date;
  public context: ContextInformation;
  public expectedValue?: number;
  public receivedValue?: number;
  public observedBehaviors?: boolean[];

  constructor(params: {
    fromRobotId: number;
    toRobotId: number;
    outcome: boolean;
    context: ContextInformation;
    expectedValue?: number;
    receivedValue?: number;
    observedBehaviors?: boolean[];
  }) {
    this.fromRobotId = params.fromRobotId;
    this.toRobotId = params.toRobotId;
    this.outcome = params.outcome;
    this.timestamp = new Date();
    this.context = params.context;
    this.expectedValue = params.expectedValue;
    this.receivedValue = params.receivedValue;
    this.observedBehaviors = params.observedBehaviors;
  }
}
