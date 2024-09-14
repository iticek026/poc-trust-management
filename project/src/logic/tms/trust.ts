export abstract class Trust {
  public value: number;
  public timestamp: Date;

  constructor() {
    this.value = 1.0; // Default trust value
    this.timestamp = new Date();
  }

  abstract calculate(peerId: number): number;

  public age(): void {
    const now = new Date();
    const timeDiff = now.getTime() - this.timestamp.getTime();
    const days = timeDiff / (1000 * 3600 * 24);

    // Apply aging factor based on days elapsed
    this.value *= Math.pow(0.99, days); // Example aging factor
  }
}
