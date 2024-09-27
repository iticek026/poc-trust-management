import { EntityCacheInstance } from "../../../utils/cache";
import { Message } from "../../common/interfaces/task";
import { RobotSwarm } from "../../robot/swarm";
import { INIT_TRUST_VALUE } from "../consts";
import { ReputationRecord } from "../reputationRecord";

export class Authority {
  private reputations: Map<number, ReputationRecord>;
  private activeRobots: Set<number>;
  private swarm?: RobotSwarm;

  constructor() {
    this.reputations = new Map();
    this.activeRobots = new Set();
  }

  public setSwarm(swarm: RobotSwarm): void {
    this.swarm = swarm;
  }

  public getReputation(robotId: number): number {
    const reputationRecord = this.reputations.get(robotId);
    return reputationRecord ? reputationRecord.reputationScore : INIT_TRUST_VALUE;
  }

  public registerRobot(robotId: number): void {
    if (!this.reputations.has(robotId)) {
      this.reputations.set(robotId, new ReputationRecord());
      this.activeRobots.add(robotId);
    }
  }

  public receiveTrustUpdate(fromRobotId: number, toRobotId: number, trustValue: number): void {
    if (!this.reputations.has(toRobotId)) {
      this.reputations.set(toRobotId, new ReputationRecord(new Date()));
    }

    const senderReputation = this.reputations.get(fromRobotId)!;

    if (senderReputation.reputationScore < 0.5) {
      return;
    }

    const reputationRecord = this.reputations.get(toRobotId)!;
    reputationRecord.reputationScore = (trustValue + senderReputation.reputationScore) / 2;
    reputationRecord.lastUpdate = new Date();
  }

  // Disconnect a robot from the swarm
  public disconnectRobot(robotId: number): void {
    if (this.activeRobots.has(robotId)) {
      this.activeRobots.delete(robotId);
      this.swarm?.removeRobot(robotId);
    }
  }

  // Send a message or command to a robot
  public notifyRobot(robotId: number, message: Message): void {
    const robot = EntityCacheInstance.getRobotById(robotId);

    this.activeRobots.delete(robotId);
    robot?.getCommunicationController()?.receiveMessage(message);
  }

  public getRobotReputations(): Map<number, ReputationRecord> {
    return this.reputations;
  }

  reset(): void {
    this.reputations = new Map();
    this.activeRobots = new Set();
  }
}

export const AuthorityInstance = new Authority();
