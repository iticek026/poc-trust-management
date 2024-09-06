import { Entity } from "../common/entity";
import { RobotState } from "../common/interfaces/interfaces";
import { Environment } from "../environment/environment";
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

  public updateMissionState(): Entity[] | undefined {
    switch (this.missionState) {
      case MissionState.SEARCHING:
        return this.handleSearchingState();
      case MissionState.TRANSPORTING:
        this.handleTransportingState();
        break;
      case MissionState.PLANNING:
        this.handlePlanningState();
        break;
    }
  }

  private handleSearchingState(): Entity[] {
    const detectedObstacles: Entity[] = [];
    this.swarm.robots.forEach((robot) => {
      const obstacles = robot.update(this.occupiedSidesHandler.getOccupiedSides());
      detectedObstacles.push(...obstacles);
    });

    if (this.occupiedSidesHandler.areAllSidesOccupied(4)) {
      console.log("All sides are occupied");
      this.transitionToPlanning();
    }

    return detectedObstacles;
  }

  private handleTransportingState() {
    this.swarm.groupPush(this.environment.searchedObject);

    if (this.swarm.planningController.didFinisthIteration()) {
      this.missionState = MissionState.PLANNING;
    }
  }

  private handlePlanningState() {
    this.swarm.planningController.collaborativelyPlanTrajectory(this.swarm.robots);
    this.missionState = MissionState.TRANSPORTING;
  }

  private transitionToPlanning() {
    this.swarm.robots.forEach((robot) => {
      robot.updateState(RobotState.PLANNING);
    });
    this.swarm.planningController.setObject(this.environment.searchedObject);
    this.swarm.planningController.collaborativelyPlanTrajectory(this.swarm.robots);

    this.missionState = MissionState.PLANNING;
  }
}
