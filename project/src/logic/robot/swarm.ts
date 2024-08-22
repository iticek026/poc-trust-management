import { Robot } from "./robot";

export class RobotSwarm {
  robots: Robot[];
  robotCache!: Map<number, Robot>;
  constructor(robots: Robot[]) {
    this.robots = robots;
    this.crateRobotCache();
  }

  private crateRobotCache() {
    this.robotCache = new Map();
    this.robots.forEach((robot) => {
      this.robotCache.set(robot.getId(), robot);
    });
  }

  getRobotById(id: number): Robot | undefined {
    return this.robotCache.get(id);
  }
}
