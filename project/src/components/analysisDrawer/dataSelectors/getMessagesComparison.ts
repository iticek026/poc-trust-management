import { AnalyticsData, ReceiveMessagesAnalyticsData } from "@/logic/analytics/interfaces";
import { formatTime } from "@/utils/time";
import { generateColor, getMaxMissionDuration } from "../utils";

export type AllRobotsMessageCountData = {
  labels: string[];
  datasets: {
    label: string;
    data: { x: string; y: number }[];
    borderColor: string;
    backgroundColor: string;
  }[];
};

export function getAllRobotsMessageCountData(
  simData: AnalyticsData[],
  timeIntervalInMs: number = 250,
): AllRobotsMessageCountData {
  const maxMissionDuration = getMaxMissionDuration(simData);

  const messagesInTime: { [time: number]: ReceiveMessagesAnalyticsData } = {};
  const timestamps: number[] = [];
  for (let i = 0; i < maxMissionDuration + 500; i += timeIntervalInMs) {
    timestamps.push(i);
    messagesInTime[i] = [];
  }

  simData.forEach((analyticsData) => {
    const messages = analyticsData.messages;

    messages.forEach((message) => {
      const timeInterval = Math.floor(message.timestamp / timeIntervalInMs) * timeIntervalInMs;

      if (messagesInTime[timeInterval] !== undefined) {
        messagesInTime[timeInterval].push(message);
      }
    });
  });

  const labels: string[] = [];
  let messageAllReceivedAccumulator = 0;
  let messageFromMalReceivedAccumulator = 0;

  const messageAllReceivedData: { y: number; x: string }[] = [];
  const messageFromMalReceivedData: { y: number; x: string }[] = [];

  timestamps.forEach((time) => {
    labels.push(formatTime(time));

    const receiveMessageValues = messagesInTime[time];
    const formatedTime = formatTime(time);

    const messageAllReceived = receiveMessageValues.filter((item) => item.wasAccepted);
    const messageFromMalReceived = messageAllReceived.filter((item) => item.isFromMalicious);

    messageAllReceivedAccumulator += messageAllReceived.length;
    messageFromMalReceivedAccumulator += messageFromMalReceived.length;

    messageAllReceivedData.push({ x: formatedTime, y: messageAllReceivedAccumulator });
    messageFromMalReceivedData.push({ x: formatedTime, y: messageFromMalReceivedAccumulator });
  });

  const datasets = [];

  datasets.push({
    label: "All received messages",
    data: messageAllReceivedData,
    borderColor: generateColor(11),
    backgroundColor: generateColor(11),
    fill: false,
    cubicInterpolationMode: "monotone",
    tension: 0.4,
    spanGaps: true,
  });

  datasets.push({
    label: "Received messages from malicious",
    data: messageFromMalReceivedData,
    borderColor: generateColor(44),
    backgroundColor: generateColor(44),
    fill: false,
    cubicInterpolationMode: "monotone",
    tension: 0.4,
    spanGaps: true,
  });

  return { labels, datasets };
}
