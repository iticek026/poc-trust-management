// class LoggerClass {
//   private static instance: LoggerClass;

//   private constructor() {}

//   static getInstance(): LoggerClass {
//     if (!LoggerClass.instance) {
//       LoggerClass.instance = new LoggerClass();
//     }

//     return LoggerClass.instance;
//   }

//   log(logLevel: LogLevelType = "log", ...args): void {
//     console[logLevel](...args);
//     localStorage.setItem("log", `${localStorage.getItem("log")}\n${args}`);
//   }
// }

class LoggerClass {
  private logs: string[] = [];
  private simRunCount: number = 0;

  private static instance: LoggerClass;

  private constructor() {}

  static getInstance(): LoggerClass {
    if (!LoggerClass.instance) {
      LoggerClass.instance = new LoggerClass();
    }

    return LoggerClass.instance;
  }

  private loadLogs(logKey: string): string[] {
    const logs = localStorage.getItem(logKey);
    return logs ? JSON.parse(logs) : [];
  }

  private saveLogs(logKey: string): void {
    localStorage.setItem(logKey, JSON.stringify(this.logs));
  }

  public info(message: string, ...args: any[]): void {
    this.addLog("INFO", message, ...args);
  }

  public warn(message: string, ...args: any[]): void {
    this.addLog("WARN", message, ...args);
  }

  public error(message: string, ...args: any[]): void {
    this.addLog("ERROR", message, ...args);
  }

  private addLog(level: string, message: string, ...args: any[]): void {
    const logEntry = `${"run-" + this.simRunCount} [${level}]: ${message} ${this.buildLogArgs(...args)}`;
    this.logs.push(logEntry);
    console.log(logEntry);
  }

  private buildLogArgs(...args: any[]): string {
    if (args.length === 0) {
      return "";
    }
    const info = args.map((arg) => {
      if (typeof arg === "object") {
        return JSON.stringify(arg);
      }
      return `${arg}`;
    });

    return info.join(" ");
  }

  public getLogs(): string[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.saveLogs("run-" + this.simRunCount);
    this.logs = [];
    this.simRunCount++;
  }

  public downloadLogs(filename: string = "logs.txt"): void {
    const blob = new Blob([this.logs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    a.style.display = "none";
    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const Logger = LoggerClass.getInstance();
