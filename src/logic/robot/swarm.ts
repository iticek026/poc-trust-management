import { EventEmitter, SimulationEvents, SimulationEventsEnum } from "../common/eventEmitter";
import { RobotState } from "../common/interfaces/interfaces";
import { MissionStateHandlerInstance } from "../simulation/missionStateHandler";
import { OccupiedSidesHandler } from "../simulation/occupiedSidesHandler";
import { LeaderRobot } from "../tms/actors/leaderRobot";
import { TrustRobot } from "../tms/actors/trustRobot";
import { CommunicationController } from "./controllers/communication/comunicationController";
import { PlanningController } from "./controllers/planningController";

export class RobotSwarm {
  robots: TrustRobot[] = [];
  readonly planningController: PlanningController;
  occupiedSidesHandler: OccupiedSidesHandler;
  communicationController: CommunicationController;
  eventEmitter: EventEmitter<SimulationEvents>;
  allRobots: TrustRobot[] = [];

  constructor(
    communicationController: CommunicationController,
    planningController: PlanningController,
    eventEmitter: EventEmitter<SimulationEvents>,
  ) {
    this.planningController = planningController;
    this.occupiedSidesHandler = new OccupiedSidesHandler();
    this.eventEmitter = eventEmitter;
    this.communicationController = communicationController;
  }

  addRobot(robot: TrustRobot) {
    this.robots.push(robot);
    this.allRobots.push(robot);
  }

  removeRobot(robotId: number) {
    const robot = this.robots.find((robot) => robot.getId() === robotId)!;
    const side = robot.getActualAssignedSide();
    if (side) {
      this.occupiedSidesHandler.releaseSide(side);
    }
    robot.setUndetectable();
    robot.stop();
    MissionStateHandlerInstance.addMalicousRobot(robot);
    this.communicationController.removeRobot(robot);

    if (robot.getRobotType() === "leader") {
      this.communicationController.unassignLeader();
    }

    robot.setIsActive(false);

    this.robots = this.robots.filter((r) => r.getId() !== robotId);

    if (this.robots.length < 4) {
      this.eventEmitter.emit(SimulationEventsEnum.INSUFFICICENT_ROBOTS);
    }
  }

  getLeader(): LeaderRobot | undefined {
    return this.robots.find((robot) => robot.getRobotType() === "leader") as LeaderRobot | undefined;
  }

  readyForTransporting() {
    const transportingRobotIds = this.occupiedSidesHandler.getTransportingRobots();

    transportingRobotIds.forEach((id) => {
      const robot = this.robots.find((robot) => robot.getId() === id);

      if (robot) {
        robot.updateState(RobotState.PLANNING);
      }
    });
  }
}
