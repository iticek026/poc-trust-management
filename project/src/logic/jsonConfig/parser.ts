import { betterAjvErrors } from "@apideck/better-ajv-errors";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { schema, SimulationConfigSchema } from "./schema";
import { isConfigOfLeaderRobot } from "../simulation/utils";

const ajv = new Ajv();

addFormats(ajv);

const validate = ajv.compile(schema);

function validateSimulationConfig(jsonConfig: SimulationConfigSchema): SimulationConfigSchema {
  const structureValid = validate(jsonConfig);

  if (!structureValid) {
    const betterErrors = betterAjvErrors({ schema, data: jsonConfig, errors: validate.errors });
    throw new Error(JSON.stringify(betterErrors, null, 2));
  }

  const thresholdsValid =
    jsonConfig.authority.AUTHORITY_ACCEPT_THRESHOLD > jsonConfig.authority.AUTHORITY_DISCONNECT_THRESHOLD;

  if (!thresholdsValid) {
    throw new Error("Authority accept threshold must be greater than authority disconnect threshold");
  }

  const leaders = jsonConfig.robots.filter((robot) => isConfigOfLeaderRobot(robot) && robot.isLeader);

  if (leaders.length > 1) {
    throw new Error(
      `Leader role is defined for: ${leaders.map((leader) => leader.label)}, but only one leader robot can be present`,
    );
  }

  return jsonConfig;
}

export const validateJsonConfig = (jsonConfig: string): void => {
  try {
    const parsedConfig = JSON.parse(jsonConfig);
    validateSimulationConfig(parsedConfig);
    return parsedConfig;
  } catch (e: unknown) {
    if (e instanceof Error) {
      throw new Error(e.message);
    }
  }
};
