import {
  IActor,
  TCoord,
  TVelocity,
  ActorType,
  TScreenInfo,
  TKeyStatus,
} from '../typedefs';

// -------------------------------------------------------------------------
import Bullet from './Bullet';
import Particle, { TParticleProps } from './Particle';
import { rotatePoint, randomNumBetween } from '../helpers';
import { playShoot, playDie, playRocketThrust } from '../sounds';

// -------------------------------------------------------------------------
export type TShipProps = {
  readonly position: TCoord;
  readonly registerActor: (item: IActor) => void;
  readonly onDie: () => void;
};

// -------------------------------------------------------------------------
const enum RotationDirection {
  left = 'left',
  right = 'right',
}

// -------------------------------------------------------------------------
export default class Ship implements IActor {
  type: ActorType;
  position: TCoord;
  velocity: TVelocity;
  rotation: number;
  rotationSpeed: number;
  speed: number;
  inertia: number;
  radius: number;
  lastShot: number;
  isDeleted: boolean;

  registerActor: (item: IActor) => void;
  onDie: () => void;

  constructor(props: TShipProps) {
    this.type = ActorType.ships;
    this.position = props.position;
    this.velocity = { dx: 0, dy: 0 };
    this.rotation = 0;
    this.rotationSpeed = 6;
    this.speed = 0.15;
    this.inertia = 0.99;
    this.radius = 20;
    this.lastShot = 0;
    this.registerActor = props.registerActor;
    this.onDie = props.onDie;
  }

  createParticle(props: TParticleProps) {
    const particle = new Particle(props);
    this.registerActor(particle);
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
    playDie();
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

    playRocketThrust();
  }

  shootBullet() {
    const bullet = new Bullet({ position: this.position, rotation: this.rotation });
    this.registerActor(bullet);
    this.lastShot = Date.now();
    playShoot();
  }

  handleControls(keyStatus: TKeyStatus) {
    if (keyStatus.up) this.accelerate(1);
    if (keyStatus.left) this.rotate(RotationDirection.left);
    if (keyStatus.right) this.rotate(RotationDirection.right);
    if (keyStatus.space && Date.now() - this.lastShot > 300) {
      this.shootBullet();
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

  evolve(screenInfo: TScreenInfo, keyStatus: TKeyStatus) {
    this.handleControls(keyStatus);
    this.move(screenInfo);
    this.clampRotation();
    this.clampBounds(screenInfo);
  }

  draw(ctx: CanvasRenderingContext2D) {
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
}
