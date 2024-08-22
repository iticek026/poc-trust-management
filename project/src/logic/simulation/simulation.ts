import { Body, Composite, Engine, Events, Render, Runner } from "matter-js";
import { Environment } from "../environment/environment";
import { RobotSwarm } from "../robot/swarm";
import { ROBOT_RADIUS } from "../robot/robot";
import { randomPointFromOtherSides } from "../../utils/robotUtils";
import { Coordinates } from "../environment/coordinates";

export class Simulation {
  environment: Environment;
  swarm: RobotSwarm;

  constructor(environment: Environment, swarm: RobotSwarm) {
    this.environment = environment;
    this.swarm = swarm;
  }

  private createRobots(engine: Engine): Array<Body> {
    return this.swarm.robots.map((robot) =>
      robot.getRobotMatterBody(engine, this.environment)
    );
  }

  start(elem: HTMLDivElement | null) {
    const engine = Engine.create(),
      world = engine.world;

    engine.gravity.y = 0;
    engine.gravity.x = 0;

    const render = Render.create({
      element: elem ?? undefined,
      engine: engine,
      options: {
        width: this.environment.width,
        height: this.environment.height,
        showVelocity: true,
      },
    });

    Render.run(render);

    const runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    Composite.add(world, this.createRobots(engine));

    this.environment.createBorders(world);

    Events.on(engine, "collisionStart", (event) => {
      const robot = this.swarm.getRobotById(event.pairs[0].bodyA.parent.id);

      if (
        !robot ||
        robot.bodyChildren.mainBody.id !== event.pairs[0].bodyA.id
      ) {
        return;
      }

      robot.setDestination(randomPointFromOtherSides(this.environment, robot));
    });

    Events.on(engine, "beforeUpdate", () => {
      this.swarm.robots.forEach((robot) => {
        robot.update();
      });
    });

    document.addEventListener("click", (event) => {
      const rect = render.canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      if (
        mouseX >= 0 &&
        mouseX <= rect.width &&
        mouseY >= 0 &&
        mouseY <= rect.height
      ) {
        this.swarm.robots.forEach((robot) => {
          robot.setDestination(
            this.handleBorderDistance(
              event.clientX - rect.left,
              event.clientY - rect.top,
              ROBOT_RADIUS
            )
          );
        });
      }
    });

    return {
      stop: () => {
        Render.stop(render);
        Runner.stop(runner);
        render.canvas.remove();
        render.textures = {};
      },
    };
  }

  private handleBorderDistance(
    destinationX: number,
    destinationY: number,
    robotRadius: number
  ): Coordinates {
    let x =
      destinationX > this.environment.width - robotRadius
        ? this.environment.width - robotRadius
        : destinationX;
    x = x < robotRadius ? robotRadius : x;
    let y =
      destinationY > this.environment.height - robotRadius
        ? this.environment.height - robotRadius
        : destinationY;
    y = y < robotRadius ? robotRadius : y;
    return new Coordinates(x, y);
  }
}
