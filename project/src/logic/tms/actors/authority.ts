import { EntityCacheInstance } from "../../../utils/cache";
import { Message } from "../../common/interfaces/task";
import { RobotSwarm } from "../../robot/swarm";
import { ConstantsInstance } from "../consts";
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
    return reputationRecord ? reputationRecord.reputationScore : ConstantsInstance.INIT_TRUST_VALUE;
  }

  public registerRobot(robotId: number): void {
    if (!this.reputations.has(robotId)) {
      this.reputations.set(robotId, new ReputationRecord(new Date()));
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
    reputationRecord.reputationScore = (trustValue + reputationRecord.reputationScore) / 2;
    reputationRecord.lastUpdate = new Date();

    if (reputationRecord.reputationScore < 0.3) {
      this.disconnectRobot(toRobotId);
    }
  }

  public disconnectRobot(robotId: number): void {
    if (this.activeRobots.has(robotId)) {
      this.activeRobots.delete(robotId);
      this.swarm?.removeRobot(robotId);
    }
  }

  public notifyRobot(robotId: number, message: Message): void {
    const robot = EntityCacheInstance.getRobotById(robotId);

    this.activeRobots.delete(robotId);
    robot?.receiveMessage(message);
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
