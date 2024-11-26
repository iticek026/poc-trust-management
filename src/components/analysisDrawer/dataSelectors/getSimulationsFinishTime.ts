import { DbData } from "@/logic/indexedDb/indexedDb";
import { groupBy } from "@/utils/utils";

export type SimulationFinishTimeData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
};

export function getSimulationFinishTimeBasedOnTrust(simData: DbData[]): SimulationFinishTimeData {
  const seedGroups = groupBy(simData, (item) => item.seed);

  const averageTrustOn: number[] = [];
  const averageTrustOff: number[] = [];

  const datasets: SimulationFinishTimeData["datasets"] = [];

  const labels: string[] = [];
  seedGroups.forEach((data, key) => {
    const seedData = data;
    const trustOn: number[] = [];
    const trustOff: number[] = [];
    seedData.forEach((item) => {
      if (item.data.isTrustApplied) {
        trustOn.push(item.data.time);
      } else {
        trustOff.push(item.data.time);
      }
    });

    averageTrustOn.push(trustOn.reduce((sum, time) => sum + time, 0) / trustOn.length);
    averageTrustOff.push(trustOff.reduce((sum, time) => sum + time, 0) / trustOff.length);
    labels.push(`Run: ${key}`);
  });

  datasets.push({
    label: "Trust On",
    data: averageTrustOn,
    borderColor: "rgba(54, 162, 235, 1)",
    backgroundColor: "rgba(54, 162, 235, 0.5)",
  });

  datasets.push({
    label: "Trust Off",
    data: averageTrustOff,
    borderColor: "rgba(255, 206, 86, 1)",
    backgroundColor: "rgba(255, 206, 86, 0.5)",
  });

  return { labels, datasets };
}
