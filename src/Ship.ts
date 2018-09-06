import {
  IGameItem,
  TPosition,
  TVelocity,
  GameItemGroup,
  TGameItemRenderProps,
  TScreenInfo,
} from './typedefs';

import Bullet from './Bullet';
import Particle, { TParticleProps } from './Particle';
import { rotatePoint, randomNumBetween } from './helpers';

export type TShipProps = {
  readonly position: TPosition;
  readonly create: (item: IGameItem, group: GameItemGroup) => void;
  readonly onDie: () => void;
};

const enum RotationDirection {
  left = 'left',
  right = 'right',
}

export default class Ship implements IGameItem {
  position: TPosition;
  velocity: TVelocity;
  rotation: number;
  rotationSpeed: number;
  speed: number;
  inertia: number;
  radius: number;
  lastShot: number;
  isDeleted: boolean;

  create: (item: IGameItem, group: GameItemGroup) => void;
  onDie: () => void;

  constructor(props) {
    this.position = props.position;
    this.velocity = { dx: 0, dy: 0 };
    this.rotation = 0;
    this.rotationSpeed = 6;
    this.speed = 0.15;
    this.inertia = 0.99;
    this.radius = 20;
    this.lastShot = 0;
    this.create = props.create;
    this.onDie = props.onDie;
  }

  createParticle(props: TParticleProps) {
    const particle = new Particle(props);
    this.create(particle, GameItemGroup.particles);
  }

  explode() {
    const { radius, position: { x, y } } = this;

    // Explode
    for (let i = 0; i < 60; i++) {
      this.createParticle({
        lifeSpan: randomNumBetween(60, 100),
        size: randomNumBetween(1, 4),
        position: {
          x: x + randomNumBetween(-radius / 4, radius / 4),
          y: y + randomNumBetween(-radius / 4, radius / 4),
        },
        velocity: { dx: randomNumBetween(-1.5, 1.5), dy: randomNumBetween(-1.5, 1.5) },
      });
    }
  }

  destroy() {
    this.isDeleted = true;
    this.onDie();
    this.explode();
  }

  rotate(direction: RotationDirection) {
    const { rotationSpeed } = this;
    if (direction === RotationDirection.left) this.rotation -= rotationSpeed;
    if (direction === RotationDirection.right) this.rotation += rotationSpeed;
  }

  accelerate(val) {
    let { dx, dy } = this.velocity;
    dx -= Math.sin(-this.rotation * Math.PI / 180) * this.speed;
    dy -= Math.cos(-this.rotation * Math.PI / 180) * this.speed;
    this.velocity = { dx, dy };

    // Thruster particles
    const { x: rx, y: ry } = rotatePoint(
      { x: 0, y: -10 },
      { x: 0, y: 0 },
      (this.rotation - 180) * Math.PI / 180
    );
    const { x, y } = this.position;
    this.createParticle({
      lifeSpan: randomNumBetween(20, 40),
      size: randomNumBetween(1, 3),
      position: { x: x + rx + randomNumBetween(-2, 2), y: y + ry + randomNumBetween(-2, 2) },
      velocity: { dx: rx / randomNumBetween(3, 5), dy: ry / randomNumBetween(3, 5) },
    });
  }

  fireBullet() {
    console.log('Ship#fireBullet');
    const bullet = new Bullet({ position: this.position, rotation: this.rotation });
    this.create(bullet, GameItemGroup.bullets);
    this.lastShot = Date.now();
  }

  handleControls(keys) {
    if (keys.up) this.accelerate(1);
    if (keys.left) this.rotate(RotationDirection.left);
    if (keys.right) this.rotate(RotationDirection.right);
    if (keys.space && Date.now() - this.lastShot > 300) {
      this.fireBullet();
    }
  }

  move({ width, height }: TScreenInfo) {
    let { x, y } = this.position;
    let { dx, dy } = this.velocity;
    this.position = { x: x + dx, y: y + dy };
    this.velocity = { dx: dx * this.inertia, dy: dy * this.inertia };
  }

  clampRotation() {
    let { rotation } = this;

    if (rotation >= 360) rotation -= 360;
    if (rotation < 0) rotation += 360;

    this.rotation = rotation;
  }

  clampBounds({ width, height }: TScreenInfo) {
    let { x, y } = this.position;

    if (x > width) x = 0;
    else if (x < 0) x = width;

    if (y > height) y = 0;
    else if (y < 0) y = height;

    this.position = { x, y };
  }

  update(screenInfo: TScreenInfo) {
    this.move(screenInfo);
    this.clampRotation();
    this.clampBounds(screenInfo);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation * Math.PI / 180);
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(10, 10);
    ctx.lineTo(5, 7);
    ctx.lineTo(-5, 7);
    ctx.lineTo(-10, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  render({ screenInfo, ctx, keys }: TGameItemRenderProps) {
    this.handleControls(keys);
    this.update(screenInfo);
    this.draw(ctx);
  }
}
