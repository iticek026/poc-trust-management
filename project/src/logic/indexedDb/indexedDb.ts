import { IDBPDatabase, openDB } from "idb";
import { AnalyticsData } from "../analytics/interfaces";

export type DbSimulationData = {
  seed: string;
  data: AnalyticsData;
};

let db: IDBPDatabase<unknown>;

export const openDatabase = async (name: string, version: number) => {
  db = await openDB(name, version, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("simulations")) {
        db.createObjectStore("simulations", { keyPath: "seed" });
      }
    },
  });
};

export const addData = async (seed: string, data: AnalyticsData) => {
  await db?.add("simulations", { seed, data });
};

export const getAllSimulations = async (): Promise<DbSimulationData[]> => {
  return await db?.getAll("simulations");
};

export const getSimulationData = async (seed: string) => {
  return await db?.get("simulations", seed);
};

export const deleteSimulation = async (seed: string) => {
  return await db?.delete("simulations", seed);
};
