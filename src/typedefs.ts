export type TCoord = {
  readonly x: number;
  readonly y: number;
};

export type TVelocity = {
  readonly dx: number;
  readonly dy: number;
};

export type TScreenInfo = {
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

/*
export type TActorRenderProps = {
  readonly ctx: any;
  readonly keyStatus: TKeyStatus;
  readonly screenInfo: TScreenInfo;
};
*/

export type TActorEvolveProps = {
  readonly keyStatus: TKeyStatus;
  readonly screenInfo: TScreenInfo;
};

export interface IActor {
  // fields:
  type: ActorType;
  isDeleted: boolean;
  position: TCoord;
  radius: number;

  // methods:
  evolve: (props: TActorEvolveProps) => void;
  draw: (ctx: any) => void;
  // render: (props: TActorRenderProps) => void;
  destroy: () => void;
}
