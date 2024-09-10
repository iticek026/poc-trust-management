import { Vector, Body } from "matter-js";
import { Robot } from "../robot";
import { Entity } from "../../common/entity";
import { Base } from "../../environment/base";
import { ObjectSide, TrajectoryStep } from "../../common/interfaces/interfaces";
import { Pathfinder } from "../../../utils/a-start";
import { EnvironmentGrid } from "../../environment/environmentGrid";

export class PlanningController {
  private trajectory: TrajectoryStep[] = [];
  private currentIndex: number = 0;
  private object: Entity | undefined;

  public reminingSteps: number = 0;

  constructor(private base: Base) {}

  public setObject(object: Entity) {
    this.object = object;
  }

  public collaborativelyPlanTrajectory(robots: Robot[], grid: EnvironmentGrid) {
    if (!this.object) {
      throw new Error("Object must be set before planning trajectory.");
    }

    const aStart = Pathfinder(this.object.getPosition(), this.base.getPosition(), grid);

    this.trajectory = this.planTrajectory(this.object.getBody(), this.base.getBody());
    this.receiveTrajectory(this.trajectory);
  }

  didFinisthIteration() {
    return this.currentIndex === this.trajectory.length;
  }

  getTrajectory() {
    return this.trajectory;
  }

  getCurrentIndex() {
    return this.currentIndex;
  }

  increaseCurrentIndex() {
    this.currentIndex++;
  }

  private planTrajectory(object: Body, base: Body): TrajectoryStep[] {
    const trajectory: TrajectoryStep[] = [];
    let currentPosition = object.position;

    while (this.reminingSteps > 0) {
      this.reminingSteps--;
      const pos = base.position;
      const step = Vector.normalise(Vector.sub(pos, currentPosition));
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

  private receiveTrajectory(trajectory: TrajectoryStep[]) {
    this.trajectory = trajectory;
    this.reminingSteps = 30;
    this.currentIndex = 0;
  }

  public isTrajectoryComplete(): boolean {
    return this.currentIndex >= this.trajectory.length;
  }
}
