import { Entity } from "../common/entity";
import { EnvironmentGrid } from "../visualization/environmentGrid";
import { RobotSwarm } from "../robot/swarm";
import { OccupiedSidesHandler } from "./occupiedSidesHandler";

export enum MissionState {
  SEARCHING = "SEARCHING",
  TRANSPORTING = "TRANSPORTING",
}

export class MissionStateHandler {
  private missionState: MissionState;
  private swarm: RobotSwarm;
  private occupiedSidesHandler: OccupiedSidesHandler;

  constructor(swarm: RobotSwarm, occupiedSidesHandler: OccupiedSidesHandler) {
    this.missionState = MissionState.SEARCHING; // Initial state
    this.swarm = swarm;
    this.occupiedSidesHandler = occupiedSidesHandler;
  }

  public getMissionState(): MissionState {
    return this.missionState;
  }

  public updateMissionState(grid: EnvironmentGrid): { searchedItem?: Entity; obstacles: Entity[] } | undefined {
    switch (this.missionState) {
      case MissionState.SEARCHING:
        return this.handleSearchingState();
      case MissionState.TRANSPORTING:
        this.handleTransportingState(grid);
        break;
    }
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

    if (this.occupiedSidesHandler.areAllSidesOccupied(4)) {
      console.log("All sides are occupied");
      this.missionState = MissionState.TRANSPORTING;
      this.swarm.updateRobotsState(this.occupiedSidesHandler.getOccupiedSides());
    }

    return { obstacles: detectedObstacles, searchedItem };
  }

  private handleTransportingState(grid: EnvironmentGrid) {
    let searchedItem: Entity | undefined;
    this.swarm.robots.forEach((robot) => {
      const objects = robot.update({
        occupiedSides: this.occupiedSidesHandler.getOccupiedSides(),
        planningController: this.swarm.planningController,
        grid,
      });

      if (!searchedItem) {
        searchedItem = objects.searchedItem;
      }
    });

    if (this.swarm.planningController.isTrajectoryComplete(searchedItem)) {
      this.swarm.planningController.collaborativelyPlanTrajectory(grid, searchedItem);
      this.swarm.planningController.nextTrajectoryNode();
    } else if (this.swarm.planningController.didFinisthIteration()) {
      this.swarm.planningController.createTrajectory(searchedItem);
    } else {
      this.swarm.planningController.nextStep();
    }
  }
}
