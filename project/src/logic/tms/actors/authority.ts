import { INIT_TRUST_VALUE } from "../consts";
import { ReputationRecord } from "../reputationRecord";
import { TrustUpdateRecord } from "../trustUpdateRecord";

export class Authority {
  private reputations: Map<number, ReputationRecord>;
  private activeRobots: Set<number>;

  constructor() {
    this.reputations = new Map();
    this.activeRobots = new Set();
  }

  public getReputation(robotId: number): number {
    const reputationRecord = this.reputations.get(robotId);
    return reputationRecord ? reputationRecord.reputationScore : INIT_TRUST_VALUE;
  }

  public registerRobot(robotId: number): void {
    if (!this.reputations.has(robotId)) {
      this.reputations.set(robotId, new ReputationRecord(robotId));
      this.activeRobots.add(robotId);
    }
  }

  public receiveTrustUpdate(fromRobotId: number, toRobotId: number, trustValue: number): void {
    if (!this.reputations.has(toRobotId)) {
      this.reputations.set(toRobotId, new ReputationRecord(toRobotId));
    }

    const reputationRecord = this.reputations.get(toRobotId)!;
    reputationRecord.addTrustUpdate(new TrustUpdateRecord(fromRobotId, toRobotId, trustValue));

    // Recalculate the reputation
    reputationRecord.calculateReputation();
  }

  // Disconnect a robot from the swarm
  public disconnectRobot(robotId: number): void {
    if (this.activeRobots.has(robotId)) {
      this.activeRobots.delete(robotId);
      // Send a disconnection command to the robot
      this.notifyRobot(robotId, "DISCONNECT");
      // console.log(`Authority: Robot ${robotId} has been disconnected due to low reputation.`);
    }
  }

  // Send a message or command to a robot
  public notifyRobot(robotId: number, message: string): void {
    // Implement communication mechanism to send a message to the robot
    // For example, using a messaging system or direct method call
    // Placeholder implementation:
    // console.log(`Authority to Robot ${robotId}: ${message}`);
  }

  // Periodically monitor robots' reputations
  public monitorRobots(): void {
    this.reputations.forEach((reputationRecord, robotId) => {
      // TODO monitor
    });
  }
}

export const AuthorityInstance = new Authority();
