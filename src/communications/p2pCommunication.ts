class P2PCommunication implements Communication {
  radius: number;
  constructor(radius: number) {
    this.radius = radius;
  }

  send(message: string): void {
    throw new Error("Method not implemented.");
  }
  receive(): string {
    throw new Error("Method not implemented.");
  }
}
