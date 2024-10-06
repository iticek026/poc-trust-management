import { Vector, Body } from "matter-js";
import { Entity } from "../../common/entity";
import { Base } from "../../environment/base";
import { ObjectSide, TrajectoryStep } from "../../common/interfaces/interfaces";
import { Pathfinder } from "../../../utils/a-start";
import { EnvironmentGrid } from "../../visualization/environmentGrid";
import { Coordinates } from "../../environment/coordinates";
import { isNearFinalDestination } from "../../../utils/movement";
import { getRelativePosition, revertAdjustedCoordinateFromGrid } from "../../../utils/environment";
import { Robot } from "../robot";
import { TrustRobot } from "../../tms/actors/trustRobot";

export class PlanningController {
  private trajectory: TrajectoryStep[] = [];
  private currentIndex: number = 0;
  private trajectoryNodes: Coordinates[] | null = null;
  private base: Base;
  public step: number = 0;

  constructor(base: Base) {
    this.base = base;
  }

  public collaborativelyPlanTrajectory(
    grid: EnvironmentGrid,
    object: Entity | undefined,
    forceNewPath: boolean = false,
  ) {
    if (!object) {
      throw new Error("Object must be set before planning trajectory.");
    }

    if (!this.trajectoryNodes || forceNewPath) {
      this.trajectoryNodes = Pathfinder(object.getPosition(), this.base.getPosition(), grid);
      grid.markPath(this.trajectoryNodes);
    }

    this.createTrajectory(object);
  }

  executeTurnBasedObjectPush(
    assignedRobot: TrustRobot,
    robotPosition: ObjectSide,
    object: Entity | undefined,
    otherRobots: TrustRobot[],
  ) {
    if (!object) {
      throw new Error("Object must be set before planning trajectory.");
    }

    const objectBody = object.getBody();

    const index = this.getStep();
    const trajectory = this.getTrajectory();

    if (index < trajectory.length) {
      const targetPosition = trajectory[index];

      if (robotPosition === targetPosition.side) {
        const pushForce = Vector.normalise(Vector.sub(targetPosition.position, objectBody.position));
        Body.applyForce(assignedRobot.getBody(), objectBody.position, Vector.mult(pushForce, 0.8));

        otherRobots.forEach((robot) => {
          robot.addObservation(assignedRobot.getId(), assignedRobot.getAssignedSide() === targetPosition.side);
        });
      } else {
        const relativePosition = getRelativePosition(object, robotPosition);
        const desiredPosition = Vector.add(objectBody.position, relativePosition);
        assignedRobot.setPosition(desiredPosition);
      }
    }
  }

  createTrajectory(object: Entity | undefined) {
    if (!this.trajectoryNodes || !object) {
      throw new Error("Cannot find path or object is undefined");
    }

    const gridCoordinates = this.trajectoryNodes[this.currentIndex];
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
  }

  private resetSteps() {
    this.step = 0;
  }

  nextTrajectoryNode() {
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
    const gridCoordinates = this.trajectoryNodes[this.currentIndex];
    const destination = new Coordinates(
      revertAdjustedCoordinateFromGrid(gridCoordinates.x),
      revertAdjustedCoordinateFromGrid(gridCoordinates.y),
    );
    return isNearFinalDestination(object.getPosition(), destination, 25);
  }
}
