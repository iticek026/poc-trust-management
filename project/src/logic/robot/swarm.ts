import { getRobotsReadyForTransporting } from "../../utils/robotUtils";
import { RobotState } from "../common/interfaces/interfaces";
import { OccupiedSides } from "../common/interfaces/occupiedSide";
import { OccupiedSidesHandler } from "../simulation/occupiedSidesHandler";
import { LeaderRobot } from "../tms/actors/leaderRobot";
import { TrustRobot } from "../tms/actors/trustRobot";
import { PlanningController } from "./controllers/planningController";

export class RobotSwarm {
  robots: TrustRobot[];
  readonly planningController: PlanningController;
  occupiedSidesHandler: OccupiedSidesHandler;

  constructor(robots: TrustRobot[], planningController: PlanningController) {
    this.robots = robots;
    this.planningController = planningController;
    this.occupiedSidesHandler = new OccupiedSidesHandler();
  }

  removeRobot(robotId: number) {
    const side = this.robots.find((robot) => robot.getId() === robotId)!.getAssignedSide();
    if (side) {
      this.occupiedSidesHandler.releaseSide(side);
    }
    this.robots = this.robots.filter((r) => r.getId() !== robotId);
  }

  getLeader(): LeaderRobot {
    return this.robots.find((robot) => robot.getRobotType() === "leader") as LeaderRobot;
  }

  updateRobotsState(occupiedSides: OccupiedSides) {
    const transportingRobots = getRobotsReadyForTransporting(occupiedSides, this.robots);
    transportingRobots.forEach((robot) => {
      robot.updateState(RobotState.PLANNING);
    });
  }
}
