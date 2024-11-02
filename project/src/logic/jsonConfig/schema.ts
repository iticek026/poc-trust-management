import { JSONSchemaType } from "ajv";

export interface SimulationConfigSchema {
  seed: string | null;
  robotGeneral: RobotGeneralConfig;
  robots: RobotConfigSchema[];
  authority: AuthorityConstants;
  environment: EnvironmentConfig;
  trust: TrustConstants & TrustConfig;
}

export interface AuthorityConstants {
  AUTHORITY_DISCONNECT_THRESHOLD: number;
  AUTHORITY_ACCEPT_THRESHOLD: number;
}

export interface RobotGeneralConfig {
  DETECTION_RADIUS: number;
}

export interface TrustConfig {
  trustErosionEnabled: boolean;
  enableTrustBasedBroadcasting: boolean;
}

interface Coordinates {
  x: number;
  y: number;
}

interface BaseRobotConfig {
  label: string;
  coordinates: Coordinates;
}

export interface ObstacleConfig {
  height: number;
  width: number;
  coordinates: CoordinateConfig;
}

export interface BaseConfig {
  height: number;
  width: number;
  coordinates: CoordinateConfig;
}

export interface CoordinateConfig {
  x: number;
  y: number;
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

export type RobotConfigSchema = RegularRobotConfigSchema | MaliciousRobotConfigSchema | LeaderRobotConfigSchema;

// const vectorSchema: JSONSchemaType<Vector> = {
//   type: "object",
//   properties: {
//     x: { type: "number" },
//     y: { type: "number" },
//   },
//   required: ["x", "y"],
//   additionalProperties: false,
// };

// const contextInformationSchema: JSONSchemaType<ContextInformationSchema> = {
//   type: "object",
//   properties: {
//     theta_base: { type: "number" },
//     numberOfMaliciousRobotsDetected: { type: "number" },
//     numberOfNeededRobots: { type: "number" },
//     exploredAreaFraction: { type: "number" },
//     wasObjectFound: { type: "boolean" },
//     availableMembers: { type: "number" },
//     totalMembers: { type: "number" },
//     sensitivityLevel: { type: "number" },
//   },
//   required: [
//     "theta_base",
//     "numberOfMaliciousRobotsDetected",
//     "numberOfNeededRobots",
//     "exploredAreaFraction",
//     "wasObjectFound",
//     "availableMembers",
//     "totalMembers",
//     "sensitivityLevel",
//   ],
//   additionalProperties: false,
// };

// const interactionSchema: JSONSchemaType<InteractionSchema> = {
//   type: "object",
//   properties: {
//     fromRobot: { type: "string" },
//     toRobot: { type: "string" },
//     outcome: { type: ["boolean", "null"], oneOf: [{ type: "boolean" }, { type: "null", nullable: true }] },
//     timestamp: { type: "string", format: "date-time" },
//     context: contextInformationSchema,
//     expectedValue: {
//       type: ["number", "object"],
//       oneOf: [{ type: "number" }, vectorSchema],
//       nullable: true,
//     },
//     receivedValue: {
//       type: ["number", "object"],
//       oneOf: [{ type: "number" }, vectorSchema],
//       nullable: true,
//     },
//     observedBehaviors: {
//       type: "array",
//       items: { type: "boolean" },
//       nullable: true,
//     },
//     trustScore: { type: "number", minimum: 0, maximum: 1 },
//   },
//   required: ["fromRobot", "toRobot", "outcome", "timestamp", "context"],
//   additionalProperties: false,
// };

// const trustRecordSchema: JSONSchemaType<TrustRecordSchema> = {
//   type: "object",
//   properties: {
//     interactions: {
//       type: "array",
//       items: interactionSchema,
//     },
//   },
//   required: ["interactions"],
//   additionalProperties: false,
// };

// const trustHistorySchema: JSONSchemaType<TrustHistorySchema> = {
//   type: "object",
//   patternProperties: {
//     "^[sa-zA-Z0-9_-]+$": trustRecordSchema,
//   },
//   required: [],
//   additionalProperties: false,
// };

export interface LeaderRobotConfigSchema extends RegularRobotConfigSchema {
  isLeader: boolean;
  isMalicious?: boolean;
}

export interface RegularRobotConfigSchema extends BaseRobotConfig {
  isLeader?: boolean;
  isMalicious?: boolean;
}

export interface MaliciousRobotConfigSchema extends BaseRobotConfig {
  isMalicious: boolean;
  falseProvidingInfoThreshold: number;
}

const regularRobotSchema: JSONSchemaType<RegularRobotConfigSchema> = {
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
  },
  required: ["label", "coordinates"],
  additionalProperties: false,
};

const leaderRobotSchema: JSONSchemaType<LeaderRobotConfigSchema> = {
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
    isLeader: { type: "boolean", enum: [true] },
    isMalicious: { type: "boolean", enum: [false], nullable: true },
  },
  required: ["label", "coordinates", "isLeader"],
  additionalProperties: false,
};

const maliciousRobotSchema: JSONSchemaType<MaliciousRobotConfigSchema> = {
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
    isMalicious: { type: "boolean", enum: [true] },
    falseProvidingInfoThreshold: {
      type: "number",
      minimum: 0,
      maximum: 1,
    },
  },
  required: ["isMalicious", "falseProvidingInfoThreshold", "label", "coordinates"],
  additionalProperties: false,
};

export const schema: JSONSchemaType<SimulationConfigSchema> = {
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
