import { isValue } from "../../utils/checks";

export enum SimulationEventsEnum {
  SIMULATION_ENDED = "simulationEnded",
  INSUFFICICENT_ROBOTS = "insufficientRobots",
}

export type SimulationEvents = {
  [SimulationEventsEnum.SIMULATION_ENDED]: undefined;
  [SimulationEventsEnum.INSUFFICICENT_ROBOTS]: { size: number };
};

interface EventEmitterInterface<T extends EventMap> {
  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): EventEmitter<T>;
  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
  dispose(): void;
}

type EventMap = Record<string, any>;

type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

/**
 * Event emitter to on, off, and emit to events.
 */
export class EventEmitter<T extends EventMap> implements EventEmitterInterface<T> {
  private events: EventMap = new Map();
  dispose(): void {
    this.events = new Map();
  }

  emit<K extends EventKey<T>>(eventName: K, params?: T[K]) {
    if (!this.events[eventName]) return;
    this.events[eventName].forEach((fn: (arg?: T[K]) => any) => (isValue(params) ? fn(params) : fn()));
  }

  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) {
    if (!this.events[eventName]) this.events[eventName] = [];
    if (!this.events[eventName]?.includes(this.events[eventName][0])) this.events[eventName]?.push(fn);
    return this;
  }

  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) {
    if (!this.events[eventName]) return;
    this.events[eventName] = this.events[eventName].filter((eventFn: EventReceiver<T[K]>) => fn !== eventFn);
  }
}
