import { Vector, Body } from "matter-js";
import { Entity } from "../../common/entity";
import { Base } from "../../environment/base";
import { ObjectSide, TrajectoryStep } from "../../common/interfaces/interfaces";
import { Pathfinder } from "../../../utils/a-start";
import { EnvironmentGrid } from "../../visualization/environmentGrid";
import { Coordinates } from "../../environment/coordinates";
import { isNearFinalDestination } from "../../../utils/movement";
import { getRelativePosition, revertAdjustedCoordinateFromGrid } from "../../../utils/environment";
import { TrustRobot } from "../../tms/actors/trustRobot";
import { isMaliciousRobot } from "@/logic/simulation/utils";

export class PlanningController {
  private trajectory: TrajectoryStep[] = [];
  private currentIndex: number = -1;
  private trajectoryNodes: Coordinates[] | null = null;
  private base: Base;
  public step: number = -1;
  private triesToFindPath: number = 0;
  public totalSteps: number = 0;

  constructor(base: Base) {
    this.base = base;
  }

  public collaborativelyPlanTrajectory(
    grid: EnvironmentGrid,
    object: Entity | undefined,
    forceNewPath: boolean = false,
  ): boolean {
    if (!object) {
      throw new Error("Object must be set before planning trajectory.");
    }

    const clone = JSON.parse(JSON.stringify(this.trajectoryNodes));
    const wasPathFoundPreviously = clone !== null;

    if (!this.trajectoryNodes || forceNewPath) {
      const newPath = Pathfinder(object.getPosition(), this.base.getPosition(), grid);
      if (this.triesToFindPath === 3) {
        return false;
      }
      if (newPath === null && wasPathFoundPreviously) {
        this.trajectoryNodes = this.returnPathToValidPoint();
        this.triesToFindPath++;
      } else if (newPath === null && !wasPathFoundPreviously) {
        return false;
      } else {
        this.trajectoryNodes = newPath;
      }
      this.currentIndex = 0;
      grid.markPath(this.trajectoryNodes);
    }

    this.createTrajectory(object);
    return true;
  }

  private returnPathToValidPoint() {
    if (!this.trajectoryNodes) {
      throw new Error("Cannot find path to return to valid point.");
    }

    const trajectory: Coordinates[] = [];
    for (let i = 0; i < 3; i++) {
      if (this.currentIndex - i < 0) {
        break;
      }
      this.prevTrajectoryNode();
      const prevPoint = this.trajectoryNodes[this.currentIndex];
      trajectory.push(prevPoint);
    }

    return trajectory;
  }

  executeTurnBasedObjectPush(assignedRobot: TrustRobot, object: Entity | undefined, otherRobots: TrustRobot[]) {
    if (!object) {
      throw new Error("Object must be set before planning trajectory.");
    }

    const objectBody = object.getBody();

    const index = this.getStep();
    const trajectory = this.getTrajectory();

    if (index < trajectory.length) {
      const targetPosition = trajectory[index];

      const shouldPush = assignedRobot.getActualAssignedSide() === targetPosition.side;

      if (shouldPush) {
        otherRobots.forEach((robot) => {
          if (isMaliciousRobot(robot) && isMaliciousRobot(assignedRobot)) {
            robot.addObservation(assignedRobot.getId(), true);
            return;
          }
          robot.addObservation(assignedRobot.getId(), assignedRobot.getAssignedSide() === targetPosition.side);
        });
      }

      if (assignedRobot.getAssignedSide() === targetPosition.side) {
        const sub = shouldPush
          ? Vector.sub(targetPosition.position, objectBody.position)
          : Vector.sub(objectBody.position, targetPosition.position);
        const pushForce = Vector.normalise(sub);
        Body.applyForce(assignedRobot.getBody(), objectBody.position, Vector.mult(pushForce, shouldPush ? 0.8 : 0.8));

        otherRobots.forEach((robot) => {
          if (isMaliciousRobot(robot) && isMaliciousRobot(assignedRobot)) {
            robot.addObservation(assignedRobot.getId(), true);
            return;
          }

          if (isMaliciousRobot(robot)) {
            robot.addMalObservation(
              assignedRobot.getId(),
              assignedRobot.getActualAssignedSide() === targetPosition.side,
            );
            return;
          }

          robot.addObservation(assignedRobot.getId(), assignedRobot.getActualAssignedSide() === targetPosition.side);
        });
      } else {
        const relativePosition = getRelativePosition(object, assignedRobot.getActualAssignedSide()!);
        const desiredPosition = Vector.add(objectBody.position, relativePosition);
        assignedRobot.setPosition(desiredPosition);
      }
    }
  }

  createTrajectory(object: Entity | undefined) {
    if (!this.trajectoryNodes || !object) {
      throw new Error("Cannot find path or object is undefined");
    }

    let index = this.currentIndex;
    if (this.currentIndex >= this.trajectoryNodes.length) {
      index = this.trajectoryNodes.length - 1;
    }

    const gridCoordinates = this.trajectoryNodes[index];

    const destination = new Coordinates(
      revertAdjustedCoordinateFromGrid(gridCoordinates.x),
      revertAdjustedCoordinateFromGrid(gridCoordinates.y),
    );
    this.trajectory = this.planTrajectory(object.getBody(), destination);
    this.resetSteps();
  }

  didFinisthIteration() {
    return this.step === this.trajectory.length;
  }

  getTrajectory() {
    return this.trajectory;
  }

  nextStep() {
    this.step++;
    this.totalSteps++;
  }

  private resetSteps() {
    this.step = 0;
  }

  prevTrajectoryNode() {
    this.currentIndex--;
  }

  nextTrajectoryNode() {
    if (this.currentIndex >= this.trajectoryNodes!.length) {
      this.currentIndex = 0;
      return;
    }

    this.currentIndex++;
  }

  getStep() {
    return this.step;
  }

  private planTrajectory(object: Body, coordinates: Coordinates): TrajectoryStep[] {
    const trajectory: TrajectoryStep[] = [];
    let currentPosition = object.position;
    const destination = coordinates.coordinates;

    while (!isNearFinalDestination(currentPosition, destination)) {
      const step = Vector.normalise(Vector.sub(destination, currentPosition));
      currentPosition = Vector.add(currentPosition, Vector.mult(step, 5)); // Adjust step size as needed

      if (step.x !== 0) {
        const stepX = { x: step.x, y: 0 };
        const sideX = this.determineObjectSide(stepX);
        trajectory.push({ position: Vector.add(currentPosition, Vector.mult(stepX, 5)), side: sideX });
      }

      if (step.y !== 0) {
        const stepY = { x: 0, y: step.y };
        const sideY = this.determineObjectSide(stepY);
        trajectory.push({ position: Vector.add(currentPosition, Vector.mult(stepY, 5)), side: sideY });
      }
    }
    return trajectory;
  }

  private determineObjectSide(step: Vector): ObjectSide {
    if (Math.abs(step.y) > Math.abs(step.x)) {
      return step.y < 0 ? ObjectSide.Bottom : ObjectSide.Top;
    } else {
      return step.x < 0 ? ObjectSide.Right : ObjectSide.Left;
    }
  }

  public isTrajectoryComplete(object: Entity | undefined): boolean {
    if (!object) return false;

    if (this.trajectoryNodes === null) return true;

    let index = this.currentIndex;
    if (this.currentIndex >= this.trajectoryNodes.length) {
      return true;
    }

    const gridCoordinates = this.trajectoryNodes[index];

    const destination = new Coordinates(
      revertAdjustedCoordinateFromGrid(gridCoordinates.x),
      revertAdjustedCoordinateFromGrid(gridCoordinates.y),
    );
    return isNearFinalDestination(object.getPosition(), destination, 25);
  }

  getBase(): Base {
    return this.base;
  }
}
