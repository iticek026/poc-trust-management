import {
  Body,
  Bounds,
  Composite,
  Engine,
  Events,
  Render,
  Runner,
} from "matter-js";

import { Robot, ROBOT_RADIUS } from "../robot/robot";
import {
  handleBorderDistance,
  randomPointFromOtherSides,
} from "../../utils/robotUtils";
import { Coordinates } from "../environment/coordinates";
import {
  simulationCofigParser,
  SimulationConfig,
} from "./simulationConfigParser";
import { RobotSwarm } from "../robot/swarm";

export class Simulation {
  private simulationConfig: SimulationConfig;

  constructor(simulationConfig: SimulationConfig) {
    this.simulationConfig = simulationConfig;
  }

  private createRobots(swarm: RobotSwarm): Array<Body> {
    return swarm.robots.map((robot) => robot.getRobotMatterBody());
  }

  start(elem: HTMLDivElement | null) {
    const engine = Engine.create({
      velocityIterations: 6,
      positionIterations: 6,
    });
    const world = engine.world;

    engine.timing.timeScale = 0.8;
    engine.gravity.y = 0;
    engine.gravity.x = 0;

    const { swarm, environment } = simulationCofigParser(
      this.simulationConfig,
      engine
    );

    const render = Render.create({
      element: elem ?? undefined,
      engine: engine,
      options: {
        width: environment.width,
        height: environment.height,
        showVelocity: true,
        wireframes: true,
        background: "#ffffff", // or '#ff0000' or other valid color string
      },
    });

    const worldBounds = Bounds.create([
      { x: ROBOT_RADIUS, y: ROBOT_RADIUS },
      {
        x: environment.width - ROBOT_RADIUS,
        y: environment.height - ROBOT_RADIUS,
      },
    ]);

    Render.run(render);

    const runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    Composite.add(world, this.createRobots(swarm));

    // const borders = environment.createBorders();

    // Composite.add(world, borders);

    function checkBounds(robot: Robot) {
      const futurePosition = {
        x: robot.getPosition().x + robot.matterBody.velocity.x + 3,
        y: robot.getPosition().y + robot.matterBody.velocity.y + 3,
      };

      if (!Bounds.contains(worldBounds, futurePosition)) {
        robot.update(
          randomPointFromOtherSides(
            environment,
            robot.getPosition() as Coordinates
          )
        );
        console.log("Approaching border, collision imminent");
      }
    }

    Events.on(engine, "beforeUpdate", () => {
      swarm.robots.forEach((robot) => {
        checkBounds(robot);
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
        swarm.robots.forEach((robot) => {
          robot.update(
            handleBorderDistance(
              event.clientX - rect.left,
              event.clientY - rect.top,
              ROBOT_RADIUS,
              environment
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
}
