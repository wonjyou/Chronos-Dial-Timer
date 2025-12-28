
export interface TimerState {
  seconds: number;
  isActive: boolean;
  isAlarming: boolean;
}

export enum InteractionMode {
  IDLE = 'IDLE',
  DRAGGING = 'DRAGGING',
  PRESSING = 'PRESSING'
}
