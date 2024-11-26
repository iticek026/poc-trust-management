import { RobotType } from "../../logic/tms/actors/interface";

export function getRobotLabel(type: RobotType | "authority", label: string) {
  switch (type) {
    case "leader":
      return `Leader robot: ${label}`;
    case "malicious":
      return `Malicious robot: ${label}`;
    case "authority":
      return "Authority";
    case "regular":
    case "unknown":
      return `Robot: ${label}`;
  }
}
