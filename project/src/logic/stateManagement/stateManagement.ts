import { RobotState } from "../common/interfaces/interfaces";

export class StateManagement {
  private state: RobotState = RobotState.SEARCHING;

  public changeState(newState: RobotState): void {
    this.state = newState;
  }

  public isSearching(): boolean {
    return this.state === RobotState.SEARCHING;
  }

  public isTransporting(): boolean {
    return this.state === RobotState.TRANSPORTING;
  }

  public isCalibratingPosition(): boolean {
    return this.state === RobotState.CALIBRATING_POSITION;
  }

  public isPlanning(): boolean {
    return this.state === RobotState.PLANNING;
  }

  public isObstacleAvoidance(): boolean {
    return this.state === RobotState.OBSTACLE_AVOIDANCE;
  }

  public isIdle(): boolean {
    return this.state === RobotState.IDLE;
  }

  public getState(): RobotState {
    return this.state;
  }
}
