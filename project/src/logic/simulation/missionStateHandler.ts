import { Entity } from "../common/entity";
import { RobotState } from "../common/interfaces/interfaces";
import { Environment } from "../environment/environment";
import { EnvironmentGrid } from "../environment/environmentGrid";
import { RobotSwarm } from "../robot/swarm";
import { OccupiedSidesHandler } from "./occupiedSidesHandler";

enum MissionState {
  SEARCHING = "SEARCHING",
  TRANSPORTING = "TRANSPORTING",
  PLANNING = "PLANNING",
}

export class MissionStateHandler {
  private missionState: MissionState;
  private swarm: RobotSwarm;
  private environment: Environment;
  private occupiedSidesHandler: OccupiedSidesHandler;

  constructor(swarm: RobotSwarm, environment: Environment, occupiedSidesHandler: OccupiedSidesHandler) {
    this.missionState = MissionState.SEARCHING; // Initial state
    this.swarm = swarm;
    this.environment = environment;
    this.occupiedSidesHandler = occupiedSidesHandler;
  }

  public getMissionState(): MissionState {
    return this.missionState;
  }

  public updateMissionState(grid: EnvironmentGrid): { searchedItem?: Entity; obstacles: Entity[] } | undefined {
    switch (this.missionState) {
      case MissionState.SEARCHING:
        return this.handleSearchingState(grid);
      case MissionState.TRANSPORTING:
        this.handleTransportingState();
        break;
      case MissionState.PLANNING:
        this.handlePlanningState(grid);
        break;
    }
  }

  private handleSearchingState(grid: EnvironmentGrid): { searchedItem?: Entity; obstacles: Entity[] } {
    const detectedObstacles: Entity[] = [];

    let searchedItem: Entity | undefined = undefined;
    this.swarm.robots.forEach((robot) => {
      const obstacles = robot.update(this.occupiedSidesHandler.getOccupiedSides());
      detectedObstacles.push(...obstacles.obstacles);
      if (obstacles.searchedItem) searchedItem = obstacles.searchedItem;
    });

    if (this.occupiedSidesHandler.areAllSidesOccupied(4)) {
      console.log("All sides are occupied");
      this.transitionToPlanning(grid);
    }

    return { obstacles: detectedObstacles, searchedItem };
  }

  private handleTransportingState() {
    this.swarm.groupPush(this.occupiedSidesHandler.getOccupiedSides());
    if (this.swarm.planningController.didFinisthIteration()) {
      this.missionState = MissionState.PLANNING;
    }
  }

  private handlePlanningState(grid: EnvironmentGrid) {
    this.swarm.planningController.collaborativelyPlanTrajectory(this.swarm.robots, grid);
    this.missionState = MissionState.TRANSPORTING;
  }

  private transitionToPlanning(grid: EnvironmentGrid) {
    this.swarm.robots.forEach((robot) => {
      robot.updateState(RobotState.PLANNING);
    });
    this.swarm.planningController.setObject(this.environment.searchedObject);
    this.swarm.planningController.collaborativelyPlanTrajectory(this.swarm.robots, grid);

    this.missionState = MissionState.PLANNING;
  }
}
