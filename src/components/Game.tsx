import { TCoord, TVelocity, TScreenInfo, IActor, ActorType, TKeyStatus } from '../typedefs';

// -------------------------------------------------------------------------
import * as React from 'react';

import Ship from '../actors/Ship';
import Asteroid from '../actors/Asteroid';
import Bullet from '../actors/Bullet';
import Particle from '../actors/Particle';

import { Scoreboard } from './Scoreboard';
import { GameOverMessage } from './GameOverMessage';
import { Controls } from './Controls';
import { Canvas } from './Canvas';

import { randomNumBetweenExcluding } from '../helpers';
import { playBackgroundMain, playBackgroundGameOver } from '../sounds';

// -------------------------------------------------------------------------
type TGameProps = {
  readonly screenInfo: TScreenInfo;
  readonly keyStatus: TKeyStatus;
};

type TGameState = {
  readonly asteroidCount: number;
  readonly currentScore: number;
  readonly topScore: number;
  readonly inGame: boolean;
};

// type TActorsMap = { [key in ActorType]: IActor[] };

// -------------------------------------------------------------------------
export class Game extends React.Component<TGameProps, TGameState> {
  state: TGameState = {
    asteroidCount: 3,
    currentScore: 0,
    topScore: localStorage['topscore'] || 0,
    inGame: false,
  };

  actors: IActor[];
  ship: Ship;

  componentDidMount() {
    // console.log('Game#componentDidMount');
    this.startGame();
  }

  refCanvas: HTMLCanvasElement | null = null;
  setRefCanvas = (refCanvas: HTMLCanvasElement | null) => {
    this.refCanvas = refCanvas;
  };

  handleClickTryAgain = () => this.startGame();

  incrementScore = (points: number) => {
    // console.log('Game#incrementScore =>', { points });
    if (!this.state.inGame) return;
    this.setState(state => ({ currentScore: state.currentScore + points }));
  };

  startGame() {
    this.setState({ inGame: true, currentScore: 0 });
    this.actors = [];
    this.generateShip();
    this.generateAsteroids(this.state.asteroidCount);
    requestAnimationFrame(this.handleAnimationFrame);
    playBackgroundMain();
  }

  handleShipDie = () => {
    this.setState({ inGame: false });

    // Replace top score
    const { currentScore, topScore } = this.state;
    if (currentScore > topScore) {
      this.setState(
        { topScore: currentScore },
        () => (localStorage['topscore'] = this.state.currentScore)
      );
    }
    playBackgroundGameOver();
  };

  appendActor = (actor: IActor) => {
    this.actors.push(actor);
  };

  generateShip() {
    const { screenInfo: { width, height } } = this.props;
    const ship = new Ship({
      position: { x: width / 2, y: height / 2 },
      registerActor: this.appendActor,
      onDie: this.handleShipDie,
    });
    // console.log('Game#startGame/3', { ship });
    this.ship = ship;
    this.appendActor(ship);
  }

  getShipPosition(): TCoord {
    return this.ship.position;
  }

  generateAsteroid({ width, height }: TScreenInfo, { x, y }: TCoord) {
    const asteroid = new Asteroid({
      size: 80,
      position: {
        x: randomNumBetweenExcluding(0, width, x - 60, x + 60),
        y: randomNumBetweenExcluding(0, height, y - 60, y + 60),
      },
      registerActor: this.appendActor,
      incrementScore: this.incrementScore,
    });
    this.appendActor(asteroid);
  }

  generateAsteroids(howMany: number) {
    const { screenInfo } = this.props;
    const position = this.getShipPosition();
    for (let i = 0; i < howMany; i++) {
      this.generateAsteroid(screenInfo, position);
    }
  }

  calcAsteroids(): IActor[] {
    return this.actors.filter(actor => actor.type === ActorType.asteroids);
  }

  calcBullets(): IActor[] {
    return this.actors.filter(actor => actor.type === ActorType.bullets);
  }

  calcParticles(): IActor[] {
    return this.actors.filter(actor => actor.type === ActorType.particles);
  }

  replenishAsteroids() {
    if (this.calcAsteroids().length > 0) return;

    let { asteroidCount } = this.state;
    asteroidCount += 1;
    this.setState({ asteroidCount });
    this.generateAsteroids(asteroidCount);
  }

  checkCollision(actor1: IActor, actor2: IActor) {
    const dx = actor1.position.x - actor2.position.x;
    const dy = actor1.position.y - actor2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < actor1.radius + actor2.radius;
  }

  checkCollisionsWith(actors1: IActor[], actors2: IActor[]) {
    for (const actor1 of actors1) {
      for (const actor2 of actors2) {
        if (this.checkCollision(actor1, actor2)) {
          actor1.destroy();
          actor2.destroy();
        }
      }
    }
  }

  removeDeletedActors() {
    this.actors = this.actors.filter(actor => !actor.isDeleted);
  }

  checkCollisions() {
    this.checkCollisionsWith(this.calcBullets(), this.calcAsteroids());
    this.checkCollisionsWith([this.ship], this.calcAsteroids());
    this.removeDeletedActors();
  }

  evolve() {
    const { screenInfo, keyStatus } = this.props;
    for (const actor of this.actors) actor.evolve(screenInfo, keyStatus);
  }

  drawBkgnd(ctx, { width, height, ratio }: TScreenInfo) {
    ctx.scale(ratio, ratio);
    ctx.fillStyle = '#000';
    ctx.globalAlpha = 0.4;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
  }

  draw() {
    if (this.refCanvas === null) return;

    const ctx: CanvasRenderingContext2D = this.refCanvas.getContext('2d');
    ctx.save();

    this.drawBkgnd(ctx, this.props.screenInfo);
    for (const actor of this.actors) actor.draw(ctx);

    ctx.restore();
  }

  handleAnimationFrame = () => {
    // console.log('Game#handleAnimationFrame');
    this.replenishAsteroids();
    this.checkCollisions();
    this.evolve();
    this.draw();
    if (this.state.inGame) requestAnimationFrame(this.handleAnimationFrame);
  };

  render() {
    // console.log('Game#render');
    const { screenInfo: { width, height, ratio } } = this.props;
    const { currentScore, topScore, inGame } = this.state;

    return (
      <div>
        {inGame ? null : (
          <GameOverMessage
            currentScore={currentScore}
            topScore={topScore}
            onClickTryAgain={this.handleClickTryAgain}
          />
        )}
        <Scoreboard currentScore={currentScore} topScore={topScore} />
        <Controls />
        {inGame ? (
          <Canvas innerRef={this.setRefCanvas} width={width * ratio} height={height * ratio} />
        ) : null}
      </div>
    );
  }
}
