import {
  IActor,
  TCoord,
  TVelocity,
  TActorRenderProps,
  TScreenInfo,
  ActorType,
} from '../typedefs';

// -------------------------------------------------------------------------
export type TParticleProps = {
  readonly position: TCoord;
  readonly size: number;
  readonly velocity: TVelocity;
  readonly lifeSpan: number;
};

// -------------------------------------------------------------------------
export default class Particle implements IActor {
  type: ActorType;
  position: TCoord;
  velocity: TVelocity;
  radius: number;
  lifeSpan: number;
  inertia: number;

  isDeleted: boolean;

  constructor(props: TParticleProps) {
    this.type = ActorType.particles;
    this.position = props.position;
    this.velocity = props.velocity;
    this.radius = props.size;
    this.lifeSpan = props.lifeSpan;
    this.inertia = 0.98;
  }

  destroy() {
    this.isDeleted = true;
  }

  move() {
    const { position, velocity, inertia } = this;
    let { x, y } = position;
    let { dx, dy } = velocity;

    x += dx;
    y += dy;
    this.position = { x, y };

    dx *= inertia;
    dy *= inertia;
    this.velocity = { dx, dy };
  }

  shrink() {
    this.radius -= 0.1;
    if (this.radius < 0.1) {
      this.radius = 0.1;
    }
    if (this.lifeSpan-- < 0) {
      this.destroy();
    }
  }

  update(_screenInfo: TScreenInfo) {
    this.move();
    this.shrink();
  }

  draw(ctx) {
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

  render({ screenInfo, ctx }: TActorRenderProps) {
    this.update(screenInfo);
    this.draw(ctx);
  }
}
