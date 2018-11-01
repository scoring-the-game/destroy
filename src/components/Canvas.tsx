import { IActor, ActorType, TScreenBounds } from '../typedefs';

// -------------------------------------------------------------------------
import * as React from 'react';

import Ship from '../actors/Ship';
import Asteroid from '../actors/Asteroid';
import Bullet from '../actors/Bullet';
import Particle from '../actors/Particle';

// -------------------------------------------------------------------------
export type TCanvasProps = {
  readonly screenBounds: TScreenBounds;
  readonly actors: IActor[];
};

type TFnDraw = (ctx: CanvasRenderingContext2D, actor: IActor) => void;

// -------------------------------------------------------------------------
function drawBkgnd(ctx: CanvasRenderingContext2D, { width, height, ratio }: TScreenBounds) {
  // ctx.scale(ratio, ratio);
  ctx.fillStyle = '#000';
  ctx.globalAlpha = 0.4;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;
}

function drawShip(ctx: CanvasRenderingContext2D, ship: Ship) {
  ctx.save();
  ctx.translate(ship.position.x, ship.position.y);
  ctx.rotate(ship.rotation * Math.PI / 180);
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

function drawAsteroid(ctx: CanvasRenderingContext2D, asteroid: Asteroid) {
  ctx.save();
  ctx.translate(asteroid.position.x, asteroid.position.y);
  ctx.rotate(asteroid.rotation * Math.PI / 180);
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -asteroid.radius);
  for (let i = 1; i < asteroid.vertices.length; i++) {
    const { x, y } = asteroid.vertices[i];
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle) {
  ctx.save();
  ctx.translate(particle.position.x, particle.position.y);
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -particle.radius);
  ctx.arc(0, 0, particle.radius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBullet(ctx: CanvasRenderingContext2D, bullet: Bullet) {
  const { x, y } = bullet.position;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(bullet.rotation * Math.PI / 180);
  ctx.fillStyle = '#fff';
  ctx.lineWidth = 0;
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

const drawMap: { [key in ActorType]: TFnDraw } = {
  [ActorType.ships]: drawShip,
  [ActorType.asteroids]: drawAsteroid,
  [ActorType.particles]: drawParticle,
  [ActorType.bullets]: drawBullet,
};

// -------------------------------------------------------------------------
export class Canvas extends React.Component<TCanvasProps> {
  canvasIsMounted: boolean = false;

  componentDidMount() {
    this.canvasIsMounted = true;
    requestAnimationFrame(this.handleAnimationFrame);
  }

  componentWillUnmount() {
    this.canvasIsMounted = false;
  }

  refCanvas: HTMLCanvasElement | null = null;
  setRefCanvas = (refCanvas: HTMLCanvasElement | null) => {
    this.refCanvas = refCanvas;
  };

  handleAnimationFrame = () => {
    if (!this.canvasIsMounted) return;

    const ctx = this.refCanvas.getContext('2d');
    ctx.save();

    drawBkgnd(ctx, this.props.screenBounds);
    for (const actor of this.props.actors) {
      const draw = drawMap[actor.type];
      draw(ctx, actor);
    }

    ctx.restore();

    requestAnimationFrame(this.handleAnimationFrame);
  };

  render() {
    const { width, height } = this.props.screenBounds;
    return <canvas ref={this.setRefCanvas} width={width} height={height} />;
  }
}
