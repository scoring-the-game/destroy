import {
  TCoord,
  TVelocity,
  IActor,
  TScreenBounds,
  ActorType,
} from '../typedefs';

// -------------------------------------------------------------------------
import { rotatePoint } from '../helpers';

// -------------------------------------------------------------------------
export type TBulletProps = {
  readonly position: TCoord;
  readonly rotation: number;
};

// -------------------------------------------------------------------------
export default class Bullet implements IActor {
  type: ActorType;
  position: TCoord;
  rotation: number;
  velocity: TVelocity;
  radius: number;
  isDeleted: boolean = false;

  constructor({ position, rotation }: TBulletProps) {
    this.type = ActorType.bullets;

    const { x: dx, y: dy } = rotatePoint(
      { x: 0, y: -20 },
      { x: 0, y: 0 },
      rotation * Math.PI / 180
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

  checkBounds({ width, height }: TScreenBounds) {
    const { x, y } = this.position;

    // Delete if it goes out of bounds
    if (x < 0 || y < 0 || x > width || y > height) {
      this.destroy();
    }
  }

  evolve(screenBounds: TScreenBounds) {
    this.move();
    this.checkBounds(screenBounds);
  }
}
