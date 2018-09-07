import { TPosition, TVelocity, IGameItem, TGameItemRenderProps, TScreenInfo, GameItemType } from './typedefs';

import { rotatePoint } from './helpers';

export type TBulletProps = {
  readonly position: TPosition;
  readonly rotation: number;
};

export default class Bullet implements IGameItem {
  type: GameItemType;
  position: TPosition;
  rotation: number;
  velocity: TVelocity;
  radius: number;
  isDeleted: boolean = false;

  constructor({ position, rotation }: TBulletProps) {
    this.type = GameItemType.bullets;

    const { x: dx, y: dy } = rotatePoint(
      { x: 0, y: -20 },
      { x: 0, y: 0 },
      (rotation * Math.PI) / 180
    );
    this.position = { x: position.x + dx, y: position.y + dy };
    this.velocity = { dx: dx / 2, dy: dy / 2 };
    this.rotation = rotation;
    this.radius = 2;
  }

  destroy() {
    this.isDeleted = true;
  }

  move() {
    let { x, y } = this.position;
    let { dx, dy } = this.velocity;
    this.position = { x: x + dx, y: y + dy };
  }

  checkBounds({ width, height }: TScreenInfo) {
    const { x, y } = this.position;

    // Delete if it goes out of bounds
    if (x < 0 || y < 0 || x > width || y > height) {
      this.destroy();
    }
  }

  update(screenInfo: TScreenInfo) {
    this.move();
    this.checkBounds(screenInfo);
  }

  draw(ctx) {
    const { x, y } = this.position;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = '#fff';
    (ctx.lineWidth = 0), 5;
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  render({ screenInfo, ctx }: TGameItemRenderProps) {
    this.update(screenInfo);
    this.draw(ctx);
  }
}
