import { Engine, Render, Runner } from "matter-js";
import { Environment } from "../logic/environment/environment";

export function initializeRender(elem: HTMLElement | null, engine: Engine, environment: Environment) {
  return Render.create({
    element: elem ?? undefined,
    engine: engine,
    options: {
      width: environment.size.width,
      height: environment.size.height,
      showVelocity: true,
      wireframes: false,
      background: "#ffffff",
    },
  });
}

export function initializeRunner() {
  return Runner.create();
}

export function initializeEngine() {
  const engine = Engine.create({
    velocityIterations: 6,
    positionIterations: 6,
  });
  engine.timing.timeScale = 0.8;
  engine.gravity.y = 0;
  engine.gravity.x = 0;
  return engine;
}
