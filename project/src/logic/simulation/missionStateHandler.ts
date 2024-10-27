import { Entity } from "../common/entity";
import { EnvironmentGrid, EnvironmentGridSingleton } from "../visualization/environmentGrid";
import { RobotSwarm } from "../robot/swarm";
import { OccupiedSidesHandler } from "./occupiedSidesHandler";
import { MissionContextData } from "../tms/interfaces";
import { ConstantsInstance } from "../tms/consts";
import { RobotState } from "../common/interfaces/interfaces";

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
    timestamp: boolean,
  ): { searchedItem?: Entity; obstacles: Entity[] } | undefined {
    const detectedObstacles: Entity[] = [];

    let searchedItem: Entity | undefined = undefined;

    const iterationMissionState = this.missionState;
    if (iterationMissionState !== MissionState.PLANNING) {
      this.swarm!.robots.forEach((robot) => {
        const obstacles = robot.update({
          occupiedSidesHandler: this.occupiedSidesHandler,
          planningController: this.swarm!.planningController,
          grid: EnvironmentGridSingleton,
          timeElapsed: timestamp,
        });
        detectedObstacles.push(...obstacles.obstacles);
        if (obstacles.searchedItem) searchedItem = obstacles.searchedItem;
      });
    }

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
    this.swarm!.robots.forEach((robot) => {
      robot.updateState(RobotState.RETURNING_HOME);
    });
  }

  addObstacles(obstacle: Entity | Entity[]) {
    if (Array.isArray(obstacle)) {
      const filteredObstacle = obstacle.filter((o) => !this.obstaclesDetectedIds.has(o.getId()));
      filteredObstacle.forEach((o) => {
        this.obstaclesDetected.push(o);
        this.obstaclesDetectedIds.add(o.getId());
      });
      return;
    }

    if (!this.obstaclesDetectedIds.has(obstacle.getId())) {
      this.obstaclesDetectedIds.add(obstacle.getId());
      this.obstaclesDetected.push(obstacle);
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
    if (!this.swarm) {
      throw new Error("Swarm is not defined");
    }

    if (this.occupiedSidesHandler.areAllSidesOccupied(4) && searchedItem) {
      this.missionState = MissionState.PLANNING;
      this.setSearchedItem(searchedItem);
      this.swarm.readyForTransporting();
    }

    return { obstacles: detectedObstacles, searchedItem };
  }

  private handleWaitingState() {
    const leader = this.swarm!.getLeader();
    const wasRobotSend = leader.sendMostTrustedAvailableMemberToObject(this.searchedItem!, this.occupiedSidesHandler);

    if (wasRobotSend && this.occupiedSidesHandler.areAllSidesOccupied(4)) {
      this.missionState = MissionState.PLANNING;
      this.swarm!.readyForTransporting();
    } else {
      // TODO stop mission and return to base
    }
  }

  private handleTransportingState(grid: EnvironmentGrid) {
    if (!this.occupiedSidesHandler.areAllSidesOccupied(4)) {
      this.missionState = MissionState.WAITING;
      return;
    }

    if (this.swarm!.planningController.isTrajectoryComplete(this.searchedItem)) {
      this.afterTrajectoryIteractionTrustUpdate();
      this.handlePlanningState(grid);
    } else if (this.swarm!.planningController.didFinisthIteration()) {
      this.afterTrajectoryIteractionTrustUpdate();
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
      numberOfNeededRobots: 4, // TODO
      wasObjectFound: this.searchedItem !== undefined,
      totalMembers: this.swarm!.robots.length,
      // timeLeftMinutes: 10, //TODO
      availableMembers: this.getAvailableRobots() ?? 0,
    };
  }

  getAvailableRobots() {
    if (!this.swarm) {
      return null;
    }
    return this.swarm!.robots.length;
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
