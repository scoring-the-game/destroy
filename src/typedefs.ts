export type TCoord = {
  readonly x: number;
  readonly y: number;
};

export type TVelocity = {
  readonly dx: number;
  readonly dy: number;
};

export type TScreenBounds = {
  readonly width: number;
  readonly height: number;
  readonly ratio: number;
};

export type TKeyStatus = {
  readonly left: boolean;
  readonly right: boolean;
  readonly up: boolean;
  readonly down: boolean;
  readonly space: boolean;
};

export const enum ActorType {
  ships = 'ships',
  asteroids = 'asteroids',
  bullets = 'bullets',
  particles = 'particles',
}

export interface IActor {
  // fields:
  type: ActorType;
  isDeleted: boolean;
  position: TCoord;
  radius: number;

  // methods:
  evolve: (screenBounds: TScreenBounds, keyStatus?: TKeyStatus) => void;
  destroy: () => void;
}
