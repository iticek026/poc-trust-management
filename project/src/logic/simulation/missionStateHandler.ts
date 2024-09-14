import { Entity } from "../common/entity";
import { EnvironmentGrid } from "../visualization/environmentGrid";
import { RobotSwarm } from "../robot/swarm";
import { OccupiedSidesHandler } from "./occupiedSidesHandler";
import { ContextData, MissionContextData } from "../tms/interfaces";

export enum MissionState {
  SEARCHING = "SEARCHING",
  TRANSPORTING = "TRANSPORTING",
  PLANNING = "PLANNING",
}

export class MissionStateHandler {
  private missionState: MissionState = MissionState.SEARCHING;
  private swarm!: RobotSwarm;
  private occupiedSidesHandler!: OccupiedSidesHandler;
  private searchedItem: Entity | undefined;
  private obstaclesDetected: Entity[] = [];

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

  setMissionState(missionState: MissionState) {
    this.missionState = missionState;
  }

  updateMissionState(grid: EnvironmentGrid): { searchedItem?: Entity; obstacles: Entity[] } | undefined {
    switch (this.missionState) {
      case MissionState.SEARCHING:
        return this.handleSearchingState();
      case MissionState.TRANSPORTING:
        this.handleTransportingState(grid);
        break;
      case MissionState.PLANNING:
        this.handlePlanningState(grid, true);
        break;
    }
  }

  addObstacles(obstacle: Entity | Entity[]) {
    if (Array.isArray(obstacle)) {
      obstacle.forEach((o) => this.obstaclesDetected.push(o));
      return;
    }

    this.obstaclesDetected.push(obstacle);
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
    this.swarm.planningController.collaborativelyPlanTrajectory(grid, this.searchedItem, forceNewPath);
    this.swarm.planningController.nextTrajectoryNode();
    this.missionState = MissionState.TRANSPORTING;
  }

  private handleSearchingState(): { searchedItem?: Entity; obstacles: Entity[] } {
    const detectedObstacles: Entity[] = [];

    let searchedItem: Entity | undefined = undefined;
    this.swarm.robots.forEach((robot) => {
      const obstacles = robot.update({
        occupiedSides: this.occupiedSidesHandler.getOccupiedSides(),
        planningController: this.swarm.planningController,
      });
      detectedObstacles.push(...obstacles.obstacles);
      if (obstacles.searchedItem) searchedItem = obstacles.searchedItem;
    });

    if (this.occupiedSidesHandler.areAllSidesOccupied(4) && searchedItem) {
      this.missionState = MissionState.PLANNING;
      this.setSearchedItem(searchedItem);
      this.swarm.updateRobotsState(this.occupiedSidesHandler.getOccupiedSides());
      console.log("All sides are occupied");
    }

    return { obstacles: detectedObstacles, searchedItem };
  }

  private handleTransportingState(grid: EnvironmentGrid) {
    this.swarm.robots.forEach((robot) => {
      robot.update({
        occupiedSides: this.occupiedSidesHandler.getOccupiedSides(),
        planningController: this.swarm.planningController,
        grid,
      });
    });

    if (this.swarm.planningController.isTrajectoryComplete(this.searchedItem)) {
      this.handlePlanningState(grid);
    } else if (this.swarm.planningController.didFinisthIteration()) {
      this.swarm.planningController.createTrajectory(this.searchedItem);
    } else {
      this.swarm.planningController.nextStep();
    }
  }

  getContextData(): MissionContextData {
    return {
      k1: 1, // TODO
      k2: 1, // TODO
      k3: 1, // TODO
      k4: 1, // TODO
      k5: 1, // TODO
      k6: 1, // TODO
      numberOfMaliciousRobotsDetected: this.detectedMaliciousRobots.length,
      numberOfNeededRobots: 4, // TODO
      wasObjectFound: this.searchedItem !== undefined,
      totalMembers: this.swarm.robots.length,
      timeLeftMinutes: 10, //TODO
      availableMembers: this.swarm.robots.length - this.detectedMaliciousRobots.length,
    };
  }
}

export const MissionStateHandlerInstance = new MissionStateHandler();
