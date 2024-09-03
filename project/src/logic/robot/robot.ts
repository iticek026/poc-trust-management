import { Body } from "matter-js";
import { Coordinates } from "../environment/coordinates";
import { MovementController } from "./controllers/movementController";
import { DetectionController } from "./controllers/detectionController";
import { EntityType, ObjectSide, RobotState } from "../common/interfaces/interfaces";
import { Entity } from "../common/entity";
import { EntityCache } from "../../utils/cache";
import { Size } from "../common/interfaces/size";
import { PlanningController } from "./controllers/planningController";
import { buildDetectionCircle, buildMatterBody } from "../../utils/bodies";
import { CommunicationController } from "./controllers/communication/comunicationController";
import { Message, MessageType } from "../common/interfaces/task";
import { OccupiedSides } from "../common/interfaces/occupiedSide";

// https://stackoverflow.com/questions/67648409/how-to-move-body-to-another-position-with-animation-in-matter-js

export const ROBOT_RADIUS = 30;
export const DETECTION_RADIUS = ROBOT_RADIUS * 3; // Adjust this value for the desired detection range

export abstract class Robot extends Entity {
  protected movementController: MovementController;
  protected detectionController: DetectionController;
  protected communicationController: CommunicationController | undefined;

  public bodyChildren!: { mainBody: Body; others: Body[] };
  public state: RobotState;
  protected assignedSide: ObjectSide | undefined;

  constructor(position: Coordinates, movementController: MovementController, detectionController: DetectionController) {
    super(EntityType.ROBOT, position, { width: ROBOT_RADIUS, height: ROBOT_RADIUS });

    this.movementController = movementController;
    this.detectionController = detectionController;

    this.state = RobotState.SEARCHING;
  }

  getAssignedSide() {
    return this.assignedSide;
  }

  protected setCommunicationController(communicationController: CommunicationController): void {
    this.communicationController = communicationController;
  }

  abstract assignCommunicationController(robots: Robot[], robotCache: Map<number, Robot>): void;

  private createBodyChildren() {
    const mainBody = buildMatterBody();
    const circle = buildDetectionCircle();

    return { mainBody: mainBody, others: [circle] };
  }

  protected create(position: Coordinates) {
    this.bodyChildren = this.createBodyChildren();

    const body = Body.create({
      parts: [this.bodyChildren.mainBody, ...this.bodyChildren.others],
      collisionFilter: { group: -1 },
      render: { fillStyle: "blue", strokeStyle: "blue", lineWidth: 3 },
    });

    Body.setPosition(body, position);

    return body;
  }

  private reportStatus() {
    return {
      id: this.getId(),
      position: this.getPosition(),
      state: this.state,
      assignedSide: this.assignedSide,
    };
  }

  getSize(): Size {
    return { width: ROBOT_RADIUS * 2, height: ROBOT_RADIUS * 2 };
  }

  getCommunicationController(): CommunicationController | undefined {
    return this.communicationController;
  }

  getMovementController(): MovementController {
    return this.movementController;
  }

  private resolveDetectedObjects(entities: Entity[]): { searchedItem: Entity | undefined; obstacles: Entity[] } {
    const detectedEntities: { searchedItem: Entity | undefined; obstacles: Entity[] } = {
      searchedItem: undefined,
      obstacles: [],
    };

    entities?.forEach((object) => {
      if (object.type === EntityType.SEARCHED_OBJECT) {
        detectedEntities.searchedItem = object;
      }

      if (object.type === EntityType.OBSTACLE) {
        detectedEntities.obstacles.push(object);
      }
    });

    return detectedEntities;
  }

  private notifyOtherMembers(searchedObject: Entity) {
    this.communicationController?.broadcastMessage({
      type: MessageType.MOVE_TO_LOCATION,
      payload: { x: searchedObject.getPosition().x, y: searchedObject.getPosition().y },
    });
  }

  public update(cache: EntityCache, occupiedSides: OccupiedSides, destination?: Coordinates): Entity[] {
    const nearbyObjects = this.detectionController.detectNearbyObjects(this, cache);
    const { searchedItem, obstacles } = this.resolveDetectedObjects(nearbyObjects);

    if (this.state === RobotState.CALIBRATING_POSITION) {
      if (searchedItem) {
        this.handleCalibratingPosition(searchedItem, occupiedSides);
      } else if (obstacles.length > 0) {
        const closestObstacle = this.movementController.findClosestObstacle(this, obstacles);
        this.movementController.calibratePosition(this, closestObstacle);
      }
    } else if ((this.state === RobotState.TRANSPORTING || this.state === RobotState.PLANNING) && searchedItem) {
      this.handleTransportingOrPlanning(searchedItem);
    } else if (this.state === RobotState.OBSTACLE_AVOIDANCE) {
      if (obstacles.length > 0) {
        const closestObstacle = this.movementController.findClosestObstacle(this, obstacles);
        if (this.movementController.getObstacleId() && closestObstacle.id !== this.movementController.getObstacleId()) {
          this.movementController.onSensorCollisionStart(closestObstacle, this);
          this.state = RobotState.CALIBRATING_POSITION;
          Body.setVelocity(this.getBody(), { x: 0, y: 0 });
          return obstacles;
        }
      }

      this.movementController.followBorder(this);
    } else if (this.state === RobotState.SEARCHING) {
      this.handleSearchingState(searchedItem, obstacles, destination);
    }

    return obstacles;
  }

  private handleSearchingState(searchedItem: Entity | undefined, obstacles: Entity[], destination?: Coordinates) {
    if (searchedItem) {
      this.notifyOtherMembers(searchedItem);
      this.state = RobotState.CALIBRATING_POSITION;
    } else if (obstacles.length > 0) {
      const closestObstacle = this.movementController.findClosestObstacle(this, obstacles);
      this.movementController.onSensorCollisionStart(closestObstacle, this);
      this.state = RobotState.CALIBRATING_POSITION;
      Body.setVelocity(this.getBody(), { x: 0, y: 0 });
    } else {
      this.movementController.move(this, destination);
    }
  }

  private handleCalibratingPosition(objectToPush: Entity, occupiedSides: OccupiedSides) {
    if (!this.assignedSide) {
      this.assignedSide = this.assignSide(objectToPush, occupiedSides);
    }

    this.movementController.moveRobotToAssignedSide(this, objectToPush, this.assignedSide as ObjectSide, occupiedSides);
  }

  private assignSide(objectToPush: Entity, occupiedSides: OccupiedSides): ObjectSide {
    const nearestSide = this.movementController.findNearestAvailableSide(
      this.getBody(),
      objectToPush.getBody(),
      occupiedSides,
    );
    return ObjectSide[nearestSide];
  }

  private handleTransportingOrPlanning(objectToPush: Entity) {
    // Implement logic for transporting or planning if needed
    // This can be expanded or adapted depending on what needs to be done
  }

  public executePush(robotSide: ObjectSide, object: Entity, planningController: PlanningController) {
    this.movementController.executeTurnBasedObjectPush(this, robotSide, object, planningController);
  }

  public executeTask(message: Message) {
    switch (message.content.type) {
      case "MOVE_TO_LOCATION":
        const coordinates = new Coordinates(message.content.payload.x, message.content.payload.y);
        this.handleMoveToLocation(coordinates);
        break;
      case "CHANGE_BEHAVIOR":
        this.handleChangeBehavior(message.content.payload);
        break;
      case "REPORT_STATUS":
        this.handleReportStatus();
        break;
      default:
        console.log(`Unknown message type: ${message.content.type}`);
    }
  }

  private handleReportStatus() {
    return this.reportStatus();
  }

  private handleMoveToLocation(location: Coordinates) {
    console.log(`Robot ${this.getId()} moving to location:`, location);
    this.movementController.move(this, location);
  }

  private handleChangeBehavior(newBehavior: RobotState) {
    console.log(`Robot ${this.getId()} changing behavior to:`, newBehavior);
    this.state = newBehavior;
  }
}
