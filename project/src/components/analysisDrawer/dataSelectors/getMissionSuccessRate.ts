import { DbData } from "@/logic/indexedDb/indexedDb";
import { groupBy } from "@/utils/utils";

export type MissionSuccessRateData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
};

export function getMissionSuccessRate(simData: DbData[]): MissionSuccessRateData {
  const analyticsGroups = groupBy(simData, (item) => item.analyticsGroupId ?? "unknown");

  const datasets: MissionSuccessRateData["datasets"] = [];

  const dataRecords: { successfulOnes: number; failedOnes: number; label: string }[] = [];
  analyticsGroups.forEach((data, key) => {
    let successfulOnes: number = 0;
    let failedOnes: number = 0;
    data.forEach((item) => {
      if (item.wasMissionSuccesfull) {
        successfulOnes++;
      } else {
        failedOnes++;
      }
    });

    dataRecords.push({ successfulOnes, failedOnes, label: key });
  });

  dataRecords.sort((a, b) => a.label.localeCompare(b.label));

  const success: number[] = [];
  const fail: number[] = [];
  const labels: string[] = [];

  dataRecords.forEach((item) => {
    success.push(item.successfulOnes);
    fail.push(item.failedOnes);
    labels.push(item.label);
  });

  datasets.push({
    label: "Successful",
    data: success,
    borderColor: "rgba(54, 162, 235, 1)",
    backgroundColor: "rgba(54, 162, 235, 0.5)",
  });

  datasets.push({
    label: "Failed",
    data: fail,
    borderColor: "rgba(255, 206, 86, 1)",
    backgroundColor: "rgba(255, 206, 86, 0.5)",
  });

  return { labels: labels.sort(), datasets };
}
