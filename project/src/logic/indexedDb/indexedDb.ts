import { IDBPDatabase, openDB } from "idb";
import { AnalyticsData } from "../analytics/interfaces";
import { isValue } from "@/utils/checks";

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

export const openDatabase = async (name: string, version: number) => {
  const db = await openDB(name, version, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("simulations")) {
        db.createObjectStore("simulations", { keyPath: "id", autoIncrement: true });
      }
    },
  });

  return db;
};

export const addData = async (data: DbData) => {
  const db = await openDatabase("simulation", 1);
  await db?.add("simulations", { data });
};

export const updateRecordName = async (key: string, label: string) => {
  const db = await openDatabase("simulation", 1);
  const record = await getSimulationData(key);
  if (!record) return;
  record.data = { ...record.data, label };
  await db?.put("simulations", record);
};

export const updateGroupName = async (key: string, groupId: string) => {
  const db = await openDatabase("simulation", 1);

  const record = await getSimulationData(key);
  if (!record) return;

  if (record.data.analyticsGroupId === groupId) return;
  record.data = { ...record.data, analyticsGroupId: groupId };
  await db?.put("simulations", record);
};

export const updateGroupNameToAll = async (currGroupId: string, newGroupId: string) => {
  const db = await openDatabase("simulation", 1);

  const allRecords = await getAllSimulations();
  if (!isValue(allRecords) || allRecords.length === 0) return;

  allRecords
    .filter((record) => record.data.analyticsGroupId === currGroupId)
    .forEach(async (record) => {
      const newRecord = { ...record };
      newRecord.data = { ...record.data, analyticsGroupId: newGroupId };
      await db?.put("simulations", newRecord);
    });
};

export const getAllSimulations = async (): Promise<DbSimulationData[] | undefined> => {
  try {
    return getAllDataCursor();
  } catch (error) {
    console.error("Error retrieving all data:", error);
  }
  return undefined;
};

async function getAllDataCursor() {
  const db = await openDatabase("simulation", 1);
  const tx = db.transaction("simulations", "readonly");
  const store = tx.objectStore("simulations");

  const allData = [];
  let cursor = await store.openCursor();

  while (cursor) {
    allData.push(cursor.value);
    cursor = await cursor.continue();
  }

  await tx.done;
  return allData;
}

export const getSimulationData = async (key: string): Promise<DbSimulationData> => {
  const db = await openDatabase("simulation", 1);

  return await db?.get("simulations", Number(key));
};

export const deleteSimulation = async (key: string) => {
  const db = await openDatabase("simulation", 1);

  return await db?.delete("simulations", Number(key));
};
