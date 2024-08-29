import { EntityCache } from "../../utils/cache";
import { ObjectSide, RobotState } from "../../utils/interfaces";
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
  private cache: EntityCache;

  constructor(
    swarm: RobotSwarm,
    environment: Environment,
    occupiedSidesHandler: OccupiedSidesHandler,
    cache: EntityCache,
  ) {
    this.missionState = MissionState.SEARCHING; // Initial state
    this.swarm = swarm;
    this.environment = environment;
    this.occupiedSidesHandler = occupiedSidesHandler;
    this.cache = cache;
  }

  public getMissionState(): MissionState {
    return this.missionState;
  }

  public updateMissionState() {
    switch (this.missionState) {
      case MissionState.SEARCHING:
        this.handleSearchingState();
        break;
      case MissionState.TRANSPORTING:
        this.handleTransportingState();
        break;
      case MissionState.PLANNING:
        this.handlePlanningState();
        break;
    }
  }

  private handleSearchingState() {
    this.swarm.robots.forEach((robot) => {
      robot.update(this.cache, this.occupiedSidesHandler.getOccupiedSides());
    });

    if (this.occupiedSidesHandler.areAllSidesOccupied(4)) {
      console.log("All sides are occupied");
      this.transitionToPlanning();
    }
  }

  private handleTransportingState() {
    this.swarm.robots.forEach((robot) => {
      const side = this.occupiedSidesHandler.findSideByRobot(robot.getId());
      robot.executeMovement(ObjectSide[side as keyof typeof ObjectSide]);
    });

    if (this.swarm.robots[0].planningController.didFinisthIteration()) {
      this.missionState = MissionState.PLANNING;
    }
  }

  private handlePlanningState() {
    this.swarm.robots[0].planningController.collaborativelyPlanTrajectory(this.swarm.robots);
    this.missionState = MissionState.TRANSPORTING;
  }

  private transitionToPlanning() {
    this.swarm.robots.forEach((robot) => {
      robot.state = RobotState.PLANNING;
      robot.planningController.setObject(this.environment.searchedObject);
    });
    this.missionState = MissionState.PLANNING;
  }
}
