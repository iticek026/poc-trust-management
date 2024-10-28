import { EntityCacheInstance } from "../../../utils/cache";
import { Message } from "../../common/interfaces/task";
import { Logger } from "../../logger/logger";
import { RobotSwarm } from "../../robot/swarm";
import { ConstantsInstance } from "../consts";
import { ReputationRecord } from "../reputationRecord";
import { erosion } from "../trust/utils";

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
    return reputationRecord ? reputationRecord.reputationScore : 0.5;
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

    if (senderReputation.reputationScore < ConstantsInstance.AUTHORITY_ACCEPT_THRESHOLD) {
      return;
    }

    const reputationRecord = this.reputations.get(toRobotId)!;
    const trustBeforeUpdate = reputationRecord.reputationScore;

    reputationRecord.reputationScore = erosion(
      (trustValue + reputationRecord.reputationScore) / 2,
      reputationRecord.lastUpdate,
      new Date(),
    );
    reputationRecord.lastUpdate = new Date();

    Logger.info(`Trust update:`, {
      madeBy: "Authority",
      from: EntityCacheInstance.getRobotById(fromRobotId)?.getLabel(),
      to: EntityCacheInstance.getRobotById(toRobotId)?.getLabel(),
      trustBeforeUpdate,
      trustAfterUpdate: reputationRecord.reputationScore,
    });

    if (reputationRecord.reputationScore < ConstantsInstance.AUTHORITY_DISCONNECT_THRESHOLD) {
      this.disconnectRobot(toRobotId);
    }
  }

  private disconnectRobot(robotId: number): void {
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
