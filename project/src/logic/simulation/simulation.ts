import { Bodies, Composite, Engine, Render, Runner } from "matter-js";
import { Environment } from "../environment/environment";
import { RobotSwarm } from "../robot/swarm";

export class Simulation {
  environment: Environment;
  swarm: RobotSwarm;

  // engine!: Engine;
  // world!: World;
  // runner!: Runner;
  // render!: Render;

  constructor(environment: Environment, swarm: RobotSwarm) {
    this.environment = environment;
    this.swarm = swarm;
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

    // create runner
    const runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    Composite.add(world, [
      // falling blocks
      Bodies.rectangle(200, 100, 60, 60, { frictionAir: 0.001 }),
      Bodies.rectangle(400, 100, 60, 60, { frictionAir: 0.05 }),
      Bodies.rectangle(600, 100, 60, 60, { frictionAir: 0.1 }),
    ]);

    this.environment.createBorders(world);

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
