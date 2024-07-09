import { RobotCommunicationClient } from "@/logic/communications/client/robotCommunicationClient";
import { RobotCommunicationFactory } from "@/logic/communications/factory/robotCommunicationFactory";
import { Coordinates } from "@/logic/environment/coordinates";

// https://stackoverflow.com/questions/67648409/how-to-move-body-to-another-position-with-animation-in-matter-js
export class Robot {
  private id: number;
  private position: Coordinates;
  private batteryLevel: number = 100;
  private health: number = 100;
  private communication: RobotCommunicationClient;
  constructor(id: number, position: Coordinates) {
    this.id = id;
    this.position = position;
    this.communication = new RobotCommunicationClient(
      new RobotCommunicationFactory()
    );
  }

  randomWalk() {
    const x = Math.floor(Math.random() * 3) - 1;
    const y = Math.floor(Math.random() * 3) - 1;
    const destination = new Coordinates(
      this.position.x + x,
      this.position.y + y
    );
    this.moveToPosition(destination);
  }

  moveToPosition(destination: Coordinates) {
    this.position = destination;
  }

  getBatteryLevel() {
    return this.batteryLevel;
  }

  getHealth() {
    return this.health;
  }

  getPosition() {
    return this.position;
  }

  getId() {
    return this.id;
  }
}
