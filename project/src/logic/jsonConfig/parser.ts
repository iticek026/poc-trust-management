import Ajv, { JSONSchemaType } from "ajv";
const ajv = new Ajv();

export interface CoordinateConfig {
  x: number;
  y: number;
}

export interface RobotConfig {
  label: string;
  coordinates: CoordinateConfig;
  isLeader?: boolean;
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

export interface SimulationConfig {
  robots: RobotConfig[];
  environment: EnvironmentConfig;
  trust: TrustConstants;
}

const schema: JSONSchemaType<SimulationConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  required: ["robots", "environment", "trust"],
  properties: {
    robots: {
      type: "array",
      items: {
        type: "object",
        required: ["label", "coordinates"],
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
          isLeader: { type: "boolean", nullable: true },
        },
        additionalProperties: false,
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
      ],
      additionalProperties: false,
    },
  },
  additionalProperties: false,
} as const;

const validate = ajv.compile(schema);

export const loadJsonConfig = (jsonConfig: string): SimulationConfig => {
  if (validate(JSON.parse(jsonConfig))) {
    return JSON.parse(jsonConfig);
  } else {
    throw new Error("Invalid JSON configuration");
  }
};
