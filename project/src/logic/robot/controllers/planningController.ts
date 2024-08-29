import { Vector, Body } from "matter-js";
import { Robot, ROBOT_RADIUS } from "../robot";
import { Entity } from "../../common/entity";
import { Base } from "../../environment/base";
import { ObjectSide, TrajectoryStep } from "../../../utils/interfaces";

export class PlanningController {
  private trajectory: TrajectoryStep[] = [];
  private currentIndex: number = 0;
  private object: Entity | undefined;

  public reminingSteps: number = 0;

  constructor(private base: Base) {}

  public setObject(object: Entity) {
    this.object = object;
  }

  public collaborativelyPlanTrajectory(robots: Robot[]) {
    if (!this.object) {
      throw new Error("Object must be set before planning trajectory.");
    }
    this.trajectory = this.planTrajectory(this.object.getBody(), this.base.getBody());
    this.shareTrajectoryWithAllRobots(robots);
  }

  didFinisthIteration() {
    return this.currentIndex === this.trajectory.length;
  }

  // Simple trajectory planning function
  private planTrajectory(object: Body, base: Body): TrajectoryStep[] {
    const trajectory: TrajectoryStep[] = [];
    let currentPosition = object.position;

    while (this.reminingSteps > 0) {
      this.reminingSteps--;
      const pos = base.position;
      const step = Vector.normalise(Vector.sub(pos, currentPosition));
      currentPosition = Vector.add(currentPosition, Vector.mult(step, 5)); // Adjust step size as needed

      // Determine the side from which the robot should push
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

  private shareTrajectoryWithAllRobots(robots: Robot[]) {
    robots.forEach((robot) => {
      robot["planningController"].receiveTrajectory(this.trajectory);
    });
  }

  // Receive the shared trajectory
  public receiveTrajectory(trajectory: TrajectoryStep[]) {
    this.trajectory = trajectory;
    this.reminingSteps = 30;
    this.currentIndex = 0;
  }

  // Execute movement based on the trajectory
  public executeTurnBasedPush(assignedRobot: Robot, robotPosition: ObjectSide) {
    if (!this.object) {
      throw new Error("Object must be set before planning trajectory.");
    }

    const object = this.object.getBody();

    if (this.currentIndex < this.trajectory.length) {
      const targetPosition = this.trajectory[this.currentIndex];

      //   if (robotPosition === targetPosition.side) {
      //     // It's this robot's turn to push
      //     const pushForce = Vector.normalise(Vector.sub(targetPosition.position, object.position));
      //     Body.applyForce(assignedRobot.getBody(), object.position, Vector.mult(pushForce, 0.055)); // Adjust force as needed
      //     // Body.setPosition(object, targetPosition.position);
      //   } else {
      const pushForce = Vector.normalise(Vector.sub(targetPosition.position, object.position));
      Body.applyForce(assignedRobot.getBody(), object.position, Vector.mult(pushForce, 0.055));
      const relativePosition = this.getRelativePosition(object, targetPosition.side);
      const desiredPosition = Vector.add(object.position, relativePosition);
      this.moveRobotWithObject(assignedRobot.getBody(), desiredPosition);
      //   }
      this.currentIndex++;

      // Non-pushing robots move to stay aligned with the object
    } else {
      console.log("Object has reached the base.");
    }
  }

  // Check if the trajectory is complete
  public isTrajectoryComplete(): boolean {
    return this.currentIndex >= this.trajectory.length;
  }

  private moveRobotWithObject(robot: Body, desiredPosition: Vector) {
    const direction = Vector.normalise(Vector.sub(desiredPosition, robot.position));
    const moveStep = Vector.mult(direction, 2); // Adjust step size as needed
    Body.setPosition(robot, Vector.add(robot.position, moveStep));
  }

  private getRelativePosition(object: Body, index: ObjectSide): Vector {
    const objectBounds = object.bounds;
    switch (index) {
      case ObjectSide.Bottom:
        return Vector.create(0, -(objectBounds.max.y - objectBounds.min.y) / 2 - ROBOT_RADIUS - 1);
      case ObjectSide.Top:
        return Vector.create(0, (objectBounds.max.y - objectBounds.min.y) / 2 + ROBOT_RADIUS + 1);
      case ObjectSide.Right:
        return Vector.create(-(objectBounds.max.x - objectBounds.min.x) / 2 - ROBOT_RADIUS - 1, 0);
      case ObjectSide.Left:
        return Vector.create((objectBounds.max.x - objectBounds.min.x) / 2 + ROBOT_RADIUS + 1, 0);
    }
  }
}
