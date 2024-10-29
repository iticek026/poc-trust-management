import { Vector } from "matter-js";
import { ContextInformation } from "../tms/trust/contextInformation";

export interface InteractionInterface {
  fromRobotId: number;
  toRobotId: number;
  outcome: boolean | null;
  timestamp: Date;
  context: ContextInformation;
  expectedValue?: number | Vector;
  receivedValue?: number | Vector;
  observedBehaviors?: boolean[];
  trustScore?: number;
}

export class Interaction implements InteractionInterface {
  public fromRobotId: number;
  public toRobotId: number;
  public outcome: boolean | null;
  public timestamp: Date;
  public context: ContextInformation;
  public expectedValue?: number | Vector;
  public receivedValue?: number | Vector;
  public observedBehaviors?: boolean[];
  public trustScore?: number;

  constructor(params: {
    fromRobotId: number;
    toRobotId: number;
    outcome: boolean | null;
    context: ContextInformation;
    expectedValue?: number | Vector;
    receivedValue?: number | Vector;
    observedBehaviors?: boolean[];
    trustScore?: number;
  }) {
    this.fromRobotId = params.fromRobotId;
    this.toRobotId = params.toRobotId;
    this.outcome = params.outcome;
    this.timestamp = new Date();
    this.context = params.context;
    this.expectedValue = params.expectedValue;
    this.receivedValue = params.receivedValue;
    this.observedBehaviors = params.observedBehaviors;
    this.trustScore = params.trustScore;
  }
}
