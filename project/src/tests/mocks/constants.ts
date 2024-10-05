import { ConstantsInstance } from "../../logic/tms/consts";
const DefaultSimulationConfig = require("../../logic/jsonConfig/default.json");

export const TestConstants = ConstantsInstance.setUp(DefaultSimulationConfig.trust);
