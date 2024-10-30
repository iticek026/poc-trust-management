import { betterAjvErrors } from "@apideck/better-ajv-errors";
import Ajv, { JSONSchemaType } from "ajv";
import addFormats from "ajv-formats";

import { TrustRecordInterface } from "../tms/trustRecord";
import { Vector } from "matter-js";
import { InteractionInterface } from "../common/interaction";
import { ContextInformationInterface } from "../tms/trust/contextInformation";
const ajv = new Ajv();

addFormats(ajv);

export interface CoordinateConfig {
  x: number;
  y: number;
}

export type RobotConfig = RegularRobotConfig | MaliciousRobotConfig | LeaderRobotConfig;

interface Coordinates {
  x: number;
  y: number;
}

interface BaseRobotConfig {
  label: string;
  coordinates: Coordinates;
}

export interface LeaderRobotConfig extends RegularRobotConfig {
  isLeader: boolean;
  isMalicious?: boolean;
}

export interface RegularRobotConfig extends BaseRobotConfig {
  isLeader?: boolean;
  isMalicious?: boolean;
  trustHistory?: TrustHistorySchema;
}

export interface MaliciousRobotConfig extends BaseRobotConfig {
  isMalicious: boolean;
  falseProvidingInfoThreshold: number;
}

export interface BaseConfig {
  height: number;
  width: number;
  coordinates: CoordinateConfig;
}

export interface ObstacleConfig {
  height: number;
  width: number;
  coordinates: CoordinateConfig;
}

export interface EnvironmentConfig {
  height: number;
  width: number;
  base: BaseConfig;
  searchedObject: ObstacleConfig;
  obstacles: ObstacleConfig[];
}

export interface TrustConstants {
  INIT_TRUST_VALUE: number;
  DIRECT_TRUST_WEIGHT: number;
  INDIRECT_TRUST_WEIGHT: number;
  AUTHORITY_TRUST_WEIGHT: number;
  LEADER_TRUST_WEIGHT: number;
  TRUSTED_PEERS_WEIGHT: number;
  OTHER_PEERS_WEIGHT: number;
  PAST_CONTEXT_WEIGHT: number;
  PAST_TRUSTEE_WEIGHT: number;
  COMMUNICATION_TRUST_WEIGHT: number;
  OBSERVATION_TRUST_WEIGHT: number;
  PRESENT_TRUST_WEIGHT: number;
  PAST_TRUST_WEIGHT: number;
  STATE_OF_TRUSTOR_WEIGHT: number;
  EXPLORED_AREA_WEIGHT: number;
  WAS_OBJECT_FOUND_WEIGHT: number;
  AVAILABLE_MEMBERS_WEIGHT: number;
  TIME_LEFT_WEIGHT: number;
  DATA_SENSITIVITY_WEIGHT: number;
}

export interface TrustConfig {
  trustErosionEnabled: boolean;
  enableTrustBasedBroadcasting: boolean;
}

export interface AuthorityConstants {
  AUTHORITY_DISCONNECT_THRESHOLD: number;
  AUTHORITY_ACCEPT_THRESHOLD: number;
}

export interface RobotGeneralConfig {
  DETECTION_RADIUS: number;
}

export interface SimulationConfig {
  seed: string | null;
  robotGeneral: RobotGeneralConfig;
  robots: RobotConfig[];
  authority: AuthorityConstants;
  environment: EnvironmentConfig;
  trust: TrustConstants & TrustConfig;
}

type InteractionSchema = Omit<InteractionInterface, "timestamp" | "context" | "fromRobotId" | "toRobotId"> & {
  timestamp: string;
  context: ContextInformationSchema;
  fromRobot: string;
  toRobot: string;
  trustScore: number;
};

type TrustRecordSchema = Omit<TrustRecordInterface, "lastUpdate" | "interactions" | "currentTrustLevel"> & {
  interactions: InteractionSchema[];
};

export type TrustHistorySchema = Record<string, TrustRecordSchema>;
type ContextInformationSchema = ContextInformationInterface;

const vectorSchema: JSONSchemaType<Vector> = {
  type: "object",
  properties: {
    x: { type: "number" },
    y: { type: "number" },
  },
  required: ["x", "y"],
  additionalProperties: false,
};

const contextInformationSchema: JSONSchemaType<ContextInformationSchema> = {
  type: "object",
  properties: {
    theta_base: { type: "number" },
    numberOfMaliciousRobotsDetected: { type: "number" },
    numberOfNeededRobots: { type: "number" },
    exploredAreaFraction: { type: "number" },
    wasObjectFound: { type: "boolean" },
    availableMembers: { type: "number" },
    totalMembers: { type: "number" },
    sensitivityLevel: { type: "number" },
  },
  required: [
    "theta_base",
    "numberOfMaliciousRobotsDetected",
    "numberOfNeededRobots",
    "exploredAreaFraction",
    "wasObjectFound",
    "availableMembers",
    "totalMembers",
    "sensitivityLevel",
  ],
  additionalProperties: false,
};

const interactionSchema: JSONSchemaType<InteractionSchema> = {
  type: "object",
  properties: {
    fromRobot: { type: "string" },
    toRobot: { type: "string" },
    outcome: { type: ["boolean", "null"], oneOf: [{ type: "boolean" }, { type: "null", nullable: true }] },
    timestamp: { type: "string", format: "date-time" },
    context: contextInformationSchema,
    expectedValue: {
      type: ["number", "object"],
      oneOf: [{ type: "number" }, vectorSchema],
      nullable: true,
    },
    receivedValue: {
      type: ["number", "object"],
      oneOf: [{ type: "number" }, vectorSchema],
      nullable: true,
    },
    observedBehaviors: {
      type: "array",
      items: { type: "boolean" },
      nullable: true,
    },
    trustScore: { type: "number", minimum: 0, maximum: 1 },
  },
  required: ["fromRobot", "toRobot", "outcome", "timestamp", "context"],
  additionalProperties: false,
};

const trustRecordSchema: JSONSchemaType<TrustRecordSchema> = {
  type: "object",
  properties: {
    interactions: {
      type: "array",
      items: interactionSchema,
    },
  },
  required: ["interactions"],
  additionalProperties: false,
};

const trustHistorySchema: JSONSchemaType<TrustHistorySchema> = {
  type: "object",
  patternProperties: {
    "^[a-zA-Z0-9_-]+$": trustRecordSchema,
  },
  required: [],
  additionalProperties: false,
};

const regularRobotSchema: JSONSchemaType<RegularRobotConfig> = {
  type: "object",
  properties: {
    label: { type: "string" },
    coordinates: {
      type: "object",
      properties: {
        x: { type: "number" },
        y: { type: "number" },
      },
      required: ["x", "y"],
      additionalProperties: false,
    },
    isLeader: { type: "boolean", enum: [false], nullable: true },
    isMalicious: { type: "boolean", enum: [false], nullable: true },
    trustHistory: { ...trustHistorySchema, nullable: true },
  },
  required: ["label", "coordinates"],
  additionalProperties: false,
};

const leaderRobotSchema: JSONSchemaType<LeaderRobotConfig> = {
  type: "object",
  properties: {
    label: { type: "string" },
    coordinates: {
      type: "object",
      properties: {
        x: { type: "number" },
        y: { type: "number" },
      },
      required: ["x", "y"],
      additionalProperties: false,
    },
    isLeader: { type: "boolean", const: true },
    isMalicious: { type: "boolean", enum: [false], nullable: true },
    trustHistory: { ...trustHistorySchema, nullable: true },
  },
  required: ["label", "coordinates", "isLeader"],
  additionalProperties: false,
};

const maliciousRobotSchema: JSONSchemaType<MaliciousRobotConfig> = {
  type: "object",
  properties: {
    label: { type: "string" },
    coordinates: {
      type: "object",
      required: ["x", "y"],
      properties: {
        x: { type: "number" },
        y: { type: "number" },
      },
    },
    isMalicious: { type: "boolean", const: true },
    falseProvidingInfoThreshold: {
      type: "number",
      minimum: 0,
      maximum: 1,
    },
  },
  required: ["isMalicious", "falseProvidingInfoThreshold", "label", "coordinates"],
  additionalProperties: false,
};

const schema: JSONSchemaType<SimulationConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  required: ["robots", "environment", "trust", "seed", "authority", "robotGeneral"],
  properties: {
    seed: { type: ["string", "null"], oneOf: [{ type: "string" }, { type: "null", nullable: true }] },
    authority: {
      type: "object",
      required: ["AUTHORITY_DISCONNECT_THRESHOLD", "AUTHORITY_ACCEPT_THRESHOLD"],
      properties: {
        AUTHORITY_DISCONNECT_THRESHOLD: { type: "number", minimum: 0, maximum: 1 },
        AUTHORITY_ACCEPT_THRESHOLD: { type: "number", minimum: 0, maximum: 1 },
      },
      additionalProperties: false,
    },
    robotGeneral: {
      type: "object",
      required: ["DETECTION_RADIUS"],
      properties: {
        DETECTION_RADIUS: { type: "number", minimum: 40 },
      },
      additionalProperties: false,
    },
    robots: {
      type: "array",
      items: {
        oneOf: [regularRobotSchema, maliciousRobotSchema, leaderRobotSchema],
      },
    },
    environment: {
      type: "object",
      required: ["height", "width", "base", "obstacles"],
      properties: {
        height: { type: "number" },
        width: { type: "number" },
        base: {
          type: "object",
          required: ["height", "width", "coordinates"],
          properties: {
            height: { type: "number" },
            width: { type: "number" },
            coordinates: {
              type: "object",
              required: ["x", "y"],
              properties: {
                x: { type: "number" },
                y: { type: "number" },
              },
            },
          },
          additionalProperties: false,
        },
        searchedObject: {
          type: "object",
          required: ["height", "width", "coordinates"],
          properties: {
            height: { type: "number" },
            width: { type: "number" },
            coordinates: {
              type: "object",
              required: ["x", "y"],
              properties: {
                x: { type: "number" },
                y: { type: "number" },
              },
            },
          },
          additionalProperties: false,
        },
        obstacles: {
          type: "array",
          items: {
            type: "object",
            required: ["height", "width", "coordinates"],
            properties: {
              height: { type: "number" },
              width: { type: "number" },
              coordinates: {
                type: "object",
                required: ["x", "y"],
                properties: {
                  x: { type: "number" },
                  y: { type: "number" },
                },
              },
            },
            additionalProperties: false,
          },
        },
      },
      additionalProperties: false,
    },
    trust: {
      type: "object",
      properties: {
        INIT_TRUST_VALUE: { type: "number" },
        DIRECT_TRUST_WEIGHT: { type: "number" },
        INDIRECT_TRUST_WEIGHT: { type: "number" },
        AUTHORITY_TRUST_WEIGHT: { type: "number" },
        LEADER_TRUST_WEIGHT: { type: "number" },
        TRUSTED_PEERS_WEIGHT: { type: "number" },
        OTHER_PEERS_WEIGHT: { type: "number" },
        PAST_CONTEXT_WEIGHT: { type: "number" },
        PAST_TRUSTEE_WEIGHT: { type: "number" },
        COMMUNICATION_TRUST_WEIGHT: { type: "number" },
        OBSERVATION_TRUST_WEIGHT: { type: "number" },
        PRESENT_TRUST_WEIGHT: { type: "number" },
        PAST_TRUST_WEIGHT: { type: "number" },
        STATE_OF_TRUSTOR_WEIGHT: { type: "number" },
        EXPLORED_AREA_WEIGHT: { type: "number" },
        WAS_OBJECT_FOUND_WEIGHT: { type: "number" },
        AVAILABLE_MEMBERS_WEIGHT: { type: "number" },
        TIME_LEFT_WEIGHT: { type: "number" },
        DATA_SENSITIVITY_WEIGHT: { type: "number" },
        trustErosionEnabled: { type: "boolean" },
        enableTrustBasedBroadcasting: { type: "boolean" },
      },
      required: [
        "INIT_TRUST_VALUE",
        "DIRECT_TRUST_WEIGHT",
        "INDIRECT_TRUST_WEIGHT",
        "AUTHORITY_TRUST_WEIGHT",
        "LEADER_TRUST_WEIGHT",
        "TRUSTED_PEERS_WEIGHT",
        "OTHER_PEERS_WEIGHT",
        "PAST_CONTEXT_WEIGHT",
        "PAST_TRUSTEE_WEIGHT",
        "COMMUNICATION_TRUST_WEIGHT",
        "OBSERVATION_TRUST_WEIGHT",
        "PRESENT_TRUST_WEIGHT",
        "PAST_TRUST_WEIGHT",
        "STATE_OF_TRUSTOR_WEIGHT",
        "EXPLORED_AREA_WEIGHT",
        "WAS_OBJECT_FOUND_WEIGHT",
        "AVAILABLE_MEMBERS_WEIGHT",
        "TIME_LEFT_WEIGHT",
        "DATA_SENSITIVITY_WEIGHT",
        "trustErosionEnabled",
      ],
      additionalProperties: false,
    },
  },
  additionalProperties: false,
} as const;

const validate = ajv.compile(schema);

function validateSimulationConfig(jsonConfig: SimulationConfig): SimulationConfig {
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
