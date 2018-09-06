export type TPosition = {
  readonly x: number;
  readonly y: number;
}

export type TVelocity = {
  readonly dx: number;
  readonly dy: number;
}

export type TScreenInfo = {
  readonly width: number;
  readonly height: number;
  readonly ratio: number;
}

export const enum GameItemGroup {
  ships = 'ships',
  asteroids = 'asteroids',
  bullets = 'bullets',
  particles = 'particles',
}

export type TGameItemRenderProps = {
  readonly ctx: any;
  readonly keys: any;
  readonly screenInfo: any;
}

export interface IGameItem {
  // fields:
  isDeleted: boolean;
  position: TPosition;
  radius: number;

  // methods:
  render: (props: TGameItemRenderProps) => void;
  destroy: () => void;
}
