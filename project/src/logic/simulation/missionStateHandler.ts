import { Entity } from "../common/entity";
import { EnvironmentGrid, EnvironmentGridSingleton } from "../visualization/environmentGrid";
import { RobotSwarm } from "../robot/swarm";
import { OccupiedSidesHandler } from "./occupiedSidesHandler";
import { MissionContextData } from "../tms/interfaces";
import { ConstantsInstance } from "../tms/consts";
import { RobotState } from "../common/interfaces/interfaces";
import { MessageType } from "../common/interfaces/task";
import { timestamp } from "./simulation";
import { isValue } from "@/utils/checks";
import { Body } from "matter-js";

export enum MissionState {
  SEARCHING = "SEARCHING",
  TRANSPORTING = "TRANSPORTING",
  PLANNING = "PLANNING",
  WAITING = "WAITING",
  CANCELLED = "CANCELLED",
}

export class MissionStateHandler {
  private missionState: MissionState = MissionState.SEARCHING;
  private swarm: RobotSwarm | undefined;
  private occupiedSidesHandler!: OccupiedSidesHandler;
  private searchedItem: Entity | undefined;
  private obstaclesDetected: Entity[] = [];
  private obstaclesDetectedIds: Set<number> = new Set();

  private detectedMaliciousRobots: Entity[] = [];

  create(swarm: RobotSwarm, occupiedSidesHandler: OccupiedSidesHandler) {
    this.swarm = swarm;
    this.occupiedSidesHandler = occupiedSidesHandler;
    return this;
  }

  setSearchedItem(searchedItem: Entity) {
    this.searchedItem = searchedItem;
  }

  getSearchedItem() {
    return this.searchedItem;
  }

  getMissionState(): MissionState {
    return this.missionState;
  }

  addMalicousRobot(robot: Entity) {
    this.detectedMaliciousRobots.push(robot);
  }

  setMissionState(missionState: MissionState) {
    this.missionState = missionState;
  }

  updateMissionState(
    grid: EnvironmentGrid,
    timeElapsed: boolean,
  ): { searchedItem?: Entity; obstacles: Entity[] } | undefined {
    const detectedObstacles: Entity[] = [];

    let searchedItem: Entity | undefined = undefined;

    const iterationMissionState = this.missionState;

    if (isValue(ConstantsInstance.TIMEOUT) && timestamp / 1000 >= ConstantsInstance.TIMEOUT) {
      this.missionState = MissionState.CANCELLED;
    }

    this.swarm!.robots.forEach((robot) => {
      if (robot.isPartOfTransporting() && iterationMissionState === MissionState.PLANNING) {
        return;
      }
      const obstacles = robot.update({
        occupiedSidesHandler: this.occupiedSidesHandler,
        planningController: this.swarm!.planningController,
        grid: EnvironmentGridSingleton,
        timeElapsed: timeElapsed,
      });
      detectedObstacles.push(...obstacles.obstacles);
      if (obstacles.searchedItem) searchedItem = obstacles.searchedItem;
    });

    switch (iterationMissionState) {
      case MissionState.SEARCHING:
        return this.handleSearchingState(searchedItem, detectedObstacles);
      case MissionState.TRANSPORTING:
        this.handleTransportingState(grid);
        break;
      case MissionState.PLANNING:
        this.handlePlanningState(grid, true);
        break;
      case MissionState.WAITING:
        this.handleWaitingState();
        break;
      case MissionState.CANCELLED:
        this.handleCancelledState();
        break;
    }
  }

  handleCancelledState() {
    if (isValue(this.searchedItem)) {
      Body.setStatic(this.searchedItem?.getBody(), true);
    }

    this.swarm!.robots.forEach((robot) => {
      robot.updateState(RobotState.RETURNING_HOME);
    });
  }

  addObstacles(obstacle: Entity | Entity[]) {
    let wasDetectedNewObstacle = false;

    if (Array.isArray(obstacle)) {
      const filteredObstacle = obstacle.filter((o) => !this.obstaclesDetectedIds.has(o.getId()));
      filteredObstacle.forEach((o) => {
        wasDetectedNewObstacle = true;
        this.obstaclesDetected.push(o);
        this.obstaclesDetectedIds.add(o.getId());
      });
    } else if (!this.obstaclesDetectedIds.has(obstacle.getId())) {
      wasDetectedNewObstacle = true;
      this.obstaclesDetectedIds.add(obstacle.getId());
      this.obstaclesDetected.push(obstacle);
    }

    if (
      wasDetectedNewObstacle &&
      (MissionStateHandlerInstance.getMissionState() === MissionState.TRANSPORTING ||
        MissionStateHandlerInstance.getMissionState() === MissionState.WAITING ||
        MissionStateHandlerInstance.getMissionState() === MissionState.PLANNING)
    ) {
      MissionStateHandlerInstance.setMissionState(MissionState.PLANNING);
    }
  }

  getObstaclesDetected() {
    return this.obstaclesDetected;
  }

  getObstacleByIds() {
    return this.obstaclesDetected.map((o) => o.getId());
  }

  getObstacleById(id: number): boolean {
    return !!this.obstaclesDetected.find((o) => o.getId() === id);
  }

  handlePlanningState(grid: EnvironmentGrid, forceNewPath = false) {
    this.swarm!.getLeader().resetSendRobotId();
    const wasPathFound = this.swarm!.planningController.collaborativelyPlanTrajectory(
      grid,
      this.searchedItem,
      forceNewPath,
    );

    if (!wasPathFound) {
      this.missionState = MissionState.CANCELLED;
      return;
    }

    this.swarm!.planningController.nextTrajectoryNode();
    this.missionState = MissionState.TRANSPORTING;
  }

  isMissionCancelled() {
    return this.missionState === MissionState.CANCELLED;
  }

  private handleSearchingState(
    searchedItem: Entity | undefined,
    detectedObstacles: Entity[],
  ): { searchedItem?: Entity; obstacles: Entity[] } {
    if (this.occupiedSidesHandler.areAllSidesOccupied(4) && searchedItem) {
      this.setSearchedItem(searchedItem);
      this.notifyAboutFullyOccupied();
    }

    return { obstacles: detectedObstacles, searchedItem };
  }

  private notifyAboutFullyOccupied() {
    if (!this.swarm) {
      throw new Error("Swarm is not defined");
    }

    this.missionState = MissionState.PLANNING;
    const mostTrusted = this.occupiedSidesHandler.getMostTrustedTransportingRobot(this.swarm);
    if (mostTrusted) {
      mostTrusted.broadcastMessage({
        type: MessageType.ALREADY_OCCUPIED,
        payload: undefined,
      });
    }
    this.swarm.readyForTransporting();
  }

  private handleWaitingState() {
    if (this.occupiedSidesHandler.areAllSidesOccupied(4)) {
      this.notifyAboutFullyOccupied();
      return;
    }

    const leader = this.swarm!.getLeader();
    const wasRobotSend = leader.sendMostTrustedAvailableMemberToObject(this.searchedItem!, this.occupiedSidesHandler);

    if (!wasRobotSend) {
      this.missionState = MissionState.CANCELLED;
    }
  }

  private handleTransportingState(grid: EnvironmentGrid) {
    if (!this.occupiedSidesHandler.areAllSidesOccupied(4)) {
      this.missionState = MissionState.WAITING;
      return;
    }

    if (this.swarm!.planningController.totalSteps % 10 === 0) {
      this.afterTrajectoryIteractionTrustUpdate();
    }

    if (this.swarm!.planningController.isTrajectoryComplete(this.searchedItem)) {
      this.handlePlanningState(grid);
    } else if (this.swarm!.planningController.didFinisthIteration()) {
      this.swarm!.planningController.createTrajectory(this.searchedItem);
    } else {
      this.swarm!.planningController.nextStep();
    }
  }

  private afterTrajectoryIteractionTrustUpdate() {
    this.swarm!.robots.forEach((robot) => {
      robot.observationsToInteractions();
    });
  }

  getContextData(): MissionContextData {
    return {
      k1: ConstantsInstance.STATE_OF_TRUSTOR_WEIGHT,
      k2: ConstantsInstance.EXPLORED_AREA_WEIGHT,
      k3: ConstantsInstance.WAS_OBJECT_FOUND_WEIGHT,
      k4: ConstantsInstance.AVAILABLE_MEMBERS_WEIGHT,
      k5: ConstantsInstance.TIME_LEFT_WEIGHT,
      k6: ConstantsInstance.DATA_SENSITIVITY_WEIGHT,
      numberOfMaliciousRobotsDetected: this.detectedMaliciousRobots.length,
      numberOfNeededRobots: 4,
      wasObjectFound: this.searchedItem !== undefined,
      totalMembers: this.swarm!.allRobots.length,
      availableMembers: this.getAvailableRobots() ?? 0,
    };
  }

  getAvailableRobots() {
    if (!this.swarm) {
      return null;
    }
    return this.swarm!.robots.length;
  }

  getNumberOfDetectedMaliciousRobots() {
    return this.detectedMaliciousRobots.length;
  }

  reset() {
    this.missionState = MissionState.SEARCHING;
    this.searchedItem = undefined;
    this.obstaclesDetected = [];
    this.detectedMaliciousRobots = [];
    this.swarm = undefined;
    this.obstaclesDetectedIds.clear();
  }
}

export const MissionStateHandlerInstance = new MissionStateHandler();
