import { DbData } from "@/logic/indexedDb/indexedDb";
import { groupBy } from "@/utils/utils";

export type DetectedMaliciousRobotsData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
};

export function getMaliciousRobotsDetected(simData: DbData[]): DetectedMaliciousRobotsData {
  const analyticsGroups = groupBy(simData, (item) => item.analyticsGroupId ?? "unknown");

  const datasets: DetectedMaliciousRobotsData["datasets"] = [];

  const dataRecords: { percentages: number; label: string }[] = [];
  analyticsGroups.forEach((data, key) => {
    let detected: number = 0;
    let notDetected: number = 0;
    data.forEach((item) => {
      detected += item.numberOfDetectedMaliciousRobots;
      notDetected += item.numberOfMaliciousRobots - item.numberOfDetectedMaliciousRobots;
    });

    dataRecords.push({
      percentages: Number(Number((detected / (detected + notDetected)) * 100).toFixed(2)),
      label: key,
    });
  });

  dataRecords.sort((a, b) => a.label.localeCompare(b.label));

  // const detectedDataset: number[] = [];
  const percentages: number[] = [];
  const labels: string[] = [];

  dataRecords.forEach((item) => {
    percentages.push(item.percentages);
    labels.push(item.label);
  });

  datasets.push({
    label: "Detected Malicious Robots Percetage",
    data: percentages,
    borderColor: "rgba(54, 162, 235, 1)",
    backgroundColor: "rgba(54, 162, 235, 0.5)",
  });

  return { labels: labels.sort(), datasets };
}
