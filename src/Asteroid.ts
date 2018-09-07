import {
  IGameItem,
  GameItemType,
  TGameItemRenderProps,
  TPosition,
  TVelocity,
  TScreenInfo,
} from './typedefs';

import Particle from './Particle';
import { asteroidVertices, randomNumBetween } from './helpers';

export type TAsteroidProps = {
  readonly position: TPosition;
  readonly size: number;
  readonly registerItem: (item: IGameItem) => void;
  readonly incrementScore: (score: number) => void;
};

export default class Asteroid implements IGameItem {
  type: GameItemType;
  position: TPosition;
  velocity: TVelocity;
  rotation: number;
  rotationSpeed: number;
  radius: number;
  score: number;
  vertices: TPosition[];
  isDeleted: boolean;

  incrementScore: (score: number) => void;
  registerItem: (item: IGameItem) => void;

  constructor(props: TAsteroidProps) {
    this.type = GameItemType.asteroids;
    this.position = props.position;
    this.velocity = { dx: randomNumBetween(-1.5, 1.5), dy: randomNumBetween(-1.5, 1.5) };
    this.rotation = 0;
    this.rotationSpeed = randomNumBetween(-1, 1);
    this.radius = props.size;
    this.score = (80 / this.radius) * 5;
    this.vertices = asteroidVertices(8, props.size);

    this.incrementScore = props.incrementScore;
    this.registerItem = props.registerItem;
  }

  calcInitialParticlePosition(): TPosition {
    const { radius } = this;
    let { x, y } = this.position;
    x += randomNumBetween(-radius / 4, radius / 4);
    y += randomNumBetween(-radius / 4, radius / 4);
    return { x, y };
  }

  calcInitialParticleVelocity(): TVelocity {
    return { dx: randomNumBetween(-1.5, 1.5), dy: randomNumBetween(-1.5, 1.5) };
  }

  generateParticle() {
    const particle = new Particle({
      position: this.calcInitialParticlePosition(),
      velocity: this.calcInitialParticleVelocity(),
      size: randomNumBetween(1, 3),
      lifeSpan: randomNumBetween(60, 100),
    });
    this.registerItem(particle);
  }

  calcInitialAsteroidPosition() {
    let { x, y } = this.position;
    x += randomNumBetween(-10, 20);
    y += randomNumBetween(-10, 20);
    return { x, y };
  }

  generateAsteroid() {
    const asteroid = new Asteroid({
      position: this.calcInitialAsteroidPosition(),
      size: this.radius / 2,
      registerItem: this.registerItem,
      incrementScore: this.incrementScore,
    });
    this.registerItem(asteroid);
  }

  destroy() {
    this.isDeleted = true;
    this.incrementScore(this.score);

    // Explode
    for (let i = 0; i < this.radius; i++) {
      this.generateParticle();
    }

    // Break into smaller asteroids
    if (this.radius > 10) {
      for (let i = 0; i < 2; i++) {
        this.generateAsteroid();
      }
    }
  }

  move() {
    let { x, y } = this.position;
    const { dx, dy } = this.velocity;
    x += dx;
    y += dy;
    this.position = { x, y };
  }

  rotate() {
    // Rotation
    this.rotation += this.rotationSpeed;
    if (this.rotation >= 360) {
      this.rotation -= 360;
    }
    if (this.rotation < 0) {
      this.rotation += 360;
    }
  }

  adjustBounds({ width, height }: TScreenInfo) {
    const { radius } = this;
    let { x, y } = this.position;

    if (x > width + radius) x = -radius;
    else if (x < -radius) x = width + radius;

    if (y > height + radius) y = -radius;
    else if (y < -radius) y = height + radius;

    this.position = { x, y };
  }

  update(screenInfo: TScreenInfo) {
    this.move();
    this.rotate();
    this.adjustBounds(screenInfo);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -this.radius);
    for (let i = 1; i < this.vertices.length; i++) {
      ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  render({ screenInfo, ctx }: TGameItemRenderProps) {
    this.update(screenInfo);
    this.draw(ctx);
  }
}
