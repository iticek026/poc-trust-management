export function formatMsToSeconds(ms: number): number {
  return Math.floor((ms / 1000) % 60);
}

export function formatTime(time: number): string {
  const minutes = Math.floor((time / (1000 * 60)) % 60);
  const seconds = formatMsToSeconds(time);
  const milliseconds = Math.floor((time % 1000) / 10);

  return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
}
