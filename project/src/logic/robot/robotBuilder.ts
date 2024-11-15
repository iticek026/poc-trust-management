import { Engine, Vector } from "matter-js";
import { Coordinates } from "../environment/coordinates";
import { Environment } from "../environment/environment";
import { DetectionController } from "./controllers/detectionController";
import { MovementController } from "./controllers/movementController";
import { PlanningController } from "./controllers/planningController";
import { Robot } from "./robot";
import { LeaderRobot } from "../tms/actors/leaderRobot";
import { TrustDataProvider } from "../tms/trustDataProvider";
import { TrustService } from "../tms/trustService";
import { AuthorityInstance } from "../tms/actors/authority";
import { TrustRobot } from "../tms/actors/trustRobot";
import { StateMachineDefinition } from "../stateMachine/stateMachine";
import { CommunicationController } from "./controllers/communication/comunicationController";
import { EventEmitter, SimulationEvents } from "../common/eventEmitter";
import { MaliciousRobot } from "../tms/actors/maliciousRobot";

export class RobotBuilder {
  private position: Coordinates;
  private movementControllerArgs?: { environment: Environment };
  private detectionControllerArgs?: { engine: Engine };
  private planningController?: PlanningController;
  private leaderRobot?: LeaderRobot;
  private trustDataProvider: TrustDataProvider;
  private label: string;
  private stateMachineDefinition: StateMachineDefinition<any>;
  private communicationController: CommunicationController;
  private eventEmitter?: EventEmitter<SimulationEvents>;
  private MAL_BEHAVIOUR_PROBABILITY?: number;

  constructor(
    label: string,
    position: Vector,
    trustDataProvider: TrustDataProvider,
    stateMachineDefinition: StateMachineDefinition<any>,
    communicationController: CommunicationController,
    leaderRobot?: LeaderRobot,
  ) {
    this.position = new Coordinates(position.x, position.y);
    this.leaderRobot = leaderRobot;
    this.trustDataProvider = trustDataProvider;
    this.label = label;
    this.stateMachineDefinition = stateMachineDefinition;
    this.communicationController = communicationController;
  }

  public setMovementControllerArgs(args: { environment: Environment }): RobotBuilder {
    this.movementControllerArgs = args;
    return this;
  }

  public setDetectionControllerArgs(args: { engine: Engine }): RobotBuilder {
    this.detectionControllerArgs = args;
    return this;
  }

  public setPlanningController(args: PlanningController): RobotBuilder {
    this.planningController = args;
    return this;
  }

  public setEventEmitter(eventEmitter: EventEmitter<SimulationEvents>): RobotBuilder {
    this.eventEmitter = eventEmitter;
    return this;
  }

  setMAL_BEHAVIOUR_PROBABILITY(threshold: number): RobotBuilder {
    this.MAL_BEHAVIOUR_PROBABILITY = threshold;
    return this;
  }

  public build<T extends TrustRobot>(RobotClass: new (...args: any[]) => T): T {
    const movementControllerFactory = (robotInstance: Robot) => {
      if (!this.movementControllerArgs) {
        throw new Error("Movement controller args are not set");
      }
      const { environment } = this.movementControllerArgs;
      return new MovementController(robotInstance, environment);
    };

    const detectionControllerFactory = (robotInstance: Robot) => {
      if (!this.detectionControllerArgs) {
        throw new Error("Detection controller args are not set");
      }
      const { engine } = this.detectionControllerArgs;
      return new DetectionController(robotInstance, engine);
    };

    const planningControllerFactory = () => {
      if (!this.planningController) {
        throw new Error("Planning controller args are not set");
      }
      return this.planningController;
    };

    let robot;
    if (RobotClass.name === MaliciousRobot.name) {
      if (!this.MAL_BEHAVIOUR_PROBABILITY) {
        throw new Error("False providing info threshold is not set");
      }

      robot = new MaliciousRobot(
        this.label,
        this.position,
        movementControllerFactory,
        detectionControllerFactory,
        planningControllerFactory,
        this.stateMachineDefinition,
        this.communicationController,
        this.MAL_BEHAVIOUR_PROBABILITY,
      );
    } else {
      robot = new RobotClass(
        this.label,
        this.position,
        movementControllerFactory,
        detectionControllerFactory,
        planningControllerFactory,
        this.stateMachineDefinition,
        this.communicationController,
        this.eventEmitter,
      );
    }

    const trustService = new TrustService(robot, AuthorityInstance, this.leaderRobot ?? null);

    this.trustDataProvider.addTrustService(trustService);
    robot.assignTrustService(trustService);
    AuthorityInstance.registerRobot(robot.getId());
    return robot as T;
  }
}
