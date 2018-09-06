import { IGameItem, GameItemGroup, TGameItemRenderProps, TPosition, TVelocity } from './typedefs';

import Particle from './Particle';
import { asteroidVertices, randomNumBetween } from './helpers';

export type TAsteroidProps = {
  readonly position: TPosition;
  readonly size: number;
  readonly create: (item: IGameItem, group: GameItemGroup) => void;
  readonly addScore: (score: number) => void;
};

export default class Asteroid implements IGameItem {
  position: TPosition;
  velocity: TVelocity;
  rotation: number;
  rotationSpeed: number;
  radius: number;
  score: number;
  vertices: TPosition[];
  isDeleted: boolean;

  addScore: (score: number) => void;
  create: (item: IGameItem, group: GameItemGroup) => void;

  constructor(props: TAsteroidProps) {
    this.position = props.position;
    this.velocity = { dx: randomNumBetween(-1.5, 1.5), dy: randomNumBetween(-1.5, 1.5) };
    this.rotation = 0;
    this.rotationSpeed = randomNumBetween(-1, 1);
    this.radius = props.size;
    this.score = 80 / this.radius * 5;
    this.vertices = asteroidVertices(8, props.size);

    this.addScore = props.addScore;
    this.create = props.create;
  }

  createParticle() {
    const particle = new Particle({
      position: {
        x: this.position.x + randomNumBetween(-this.radius / 4, this.radius / 4),
        y: this.position.y + randomNumBetween(-this.radius / 4, this.radius / 4),
      },
      size: randomNumBetween(1, 3),
      velocity: { dx: randomNumBetween(-1.5, 1.5), dy: randomNumBetween(-1.5, 1.5) },
      lifeSpan: randomNumBetween(60, 100),
    });
    this.create(particle, GameItemGroup.particles);
  }

  createAsteroid() {
    let asteroid = new Asteroid({
      size: this.radius / 2,
      position: {
        x: randomNumBetween(-10, 20) + this.position.x,
        y: randomNumBetween(-10, 20) + this.position.y,
      },
      create: this.create,
      addScore: this.addScore,
    });
    this.create(asteroid, GameItemGroup.asteroids);
  }

  destroy() {
    this.isDeleted = true;
    this.addScore(this.score);

    // Explode
    for (let i = 0; i < this.radius; i++) {
      this.createParticle();
    }

    // Break into smaller asteroids
    if (this.radius > 10) {
      for (let i = 0; i < 2; i++) {
        this.createAsteroid();
      }
    }
  }

  render({ screenInfo, ctx }: TGameItemRenderProps) {
    // Move
    this.position.x += this.velocity.dx;
    this.position.y += this.velocity.dy;

    // Rotation
    this.rotation += this.rotationSpeed;
    if (this.rotation >= 360) {
      this.rotation -= 360;
    }
    if (this.rotation < 0) {
      this.rotation += 360;
    }

    // Screen edges
    if (this.position.x > screenInfo.width + this.radius) this.position.x = -this.radius;
    else if (this.position.x < -this.radius) this.position.x = screenInfo.width + this.radius;
    if (this.position.y > screenInfo.height + this.radius) this.position.y = -this.radius;
    else if (this.position.y < -this.radius) this.position.y = screenInfo.height + this.radius;

    // Draw
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation * Math.PI / 180);
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
}
