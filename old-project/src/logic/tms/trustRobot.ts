import { Coordinates } from "@/logic/environment/coordinates";
import { Robot } from "@/logic/robot/robot";
import { Experience, Reputation } from "./interfaces";
import { TrustManagementSystem } from "./trustManagement";

export class TrustRobot extends Robot {
  reputation: Reputation;
  pastExperiences: Experience[] = [];
  tms: TrustManagementSystem;

  constructor(id: number, position: Coordinates, tms: TrustManagementSystem) {
    super(id, position);
    this.tms = tms;
    this.reputation = 0; // TODO Calculate initial reputation
  }
}
