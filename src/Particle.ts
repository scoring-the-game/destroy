import { IGameItem, TPosition, TVelocity, TGameItemRenderProps } from './typedefs';

export type TParticleProps = {
  readonly position: TPosition;
  readonly size: number;
  readonly velocity: TVelocity;
  readonly lifeSpan: number;
}

export default class Particle implements IGameItem {
  position: TPosition;
  velocity: TVelocity;
  radius: number;
  lifeSpan: number;
  inertia: number;

  isDeleted: boolean;

  constructor(props: TParticleProps) {
    this.position = props.position;
    this.velocity = props.velocity;
    this.radius = props.size;
    this.lifeSpan = props.lifeSpan;
    this.inertia = 0.98;
  }

  destroy() {
    this.isDeleted = true;
  }

  render({ ctx }: TGameItemRenderProps) {
    // Move
    this.position.x += this.velocity.dx;
    this.position.y += this.velocity.dy;
    this.velocity.x *= this.inertia;
    this.velocity.y *= this.inertia;

    // Shrink
    this.radius -= 0.1;
    if (this.radius < 0.1) {
      this.radius = 0.1;
    }
    if (this.lifeSpan-- < 0) {
      this.destroy();
    }

    // Draw
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -this.radius);
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
