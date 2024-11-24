import { IDBPDatabase, openDB } from "idb";
import { AnalyticsData } from "../analytics/interfaces";

export type DbSimulationData = {
  id: string;
  data: DbData;
};

export type DbData = {
  label: string;
  data: AnalyticsData;
  seed: string;
  analyticsGroupId: string | null;
  wasMissionSuccesfull: boolean;
  numberOfMaliciousRobots: number;
  numberOfDetectedMaliciousRobots: number;
};

let db: IDBPDatabase<unknown>;

export const openDatabase = async (name: string, version: number) => {
  db = await openDB(name, version, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("simulations")) {
        db.createObjectStore("simulations", { keyPath: "id", autoIncrement: true });
      }
    },
  });
};

export const addData = async (data: DbData) => {
  await db?.add("simulations", { data });
};

export const updateRecordName = async (key: string, label: string) => {
  const record = await getSimulationData(key);
  if (!record) return;
  record.data = { ...record.data, label };
  await db?.put("simulations", record);
};

export const updateGroupName = async (key: string, groupId: string) => {
  const record = await getSimulationData(key);
  if (!record) return;

  if (record.data.analyticsGroupId === groupId) return;
  record.data = { ...record.data, analyticsGroupId: groupId };
  await db?.put("simulations", record);
};

export const updateGroupNameToAll = async (currGroupId: string, newGroupId: string) => {
  const allRecords = await getAllSimulations();
  if (allRecords.length === 0) return;

  allRecords
    .filter((record) => record.data.analyticsGroupId === currGroupId)
    .forEach(async (record) => {
      const newRecord = { ...record };
      newRecord.data = { ...record.data, analyticsGroupId: newGroupId };
      await db?.put("simulations", newRecord);
    });
};

export const getAllSimulations = async (): Promise<DbSimulationData[]> => {
  return await db?.getAll("simulations");
};

export const getSimulationData = async (key: string): Promise<DbSimulationData> => {
  return await db?.get("simulations", Number(key));
};

export const deleteSimulation = async (key: string) => {
  return await db?.delete("simulations", Number(key));
};
