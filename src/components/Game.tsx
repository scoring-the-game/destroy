import {
  TCoord,
  TVelocity,
  TScreenInfo,
  IActor,
  ActorType,
  TKeyStatus,
} from '../typedefs';

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

type TActorsMap = { [key in ActorType]: IActor[] };

// -------------------------------------------------------------------------
export class Game extends React.Component<TGameProps, TGameState> {
  state: TGameState = {
    asteroidCount: 3,
    currentScore: 0,
    topScore: localStorage['topscore'] || 0,
    inGame: false,
  };

  actorsMap: TActorsMap;

  componentDidMount() {
    console.log('Game#componentDidMount');
    this.startGame();
    requestAnimationFrame(this.tick);
  }

  refCanvas: HTMLCanvasElement | null = null;
  setRefCanvas = (refCanvas: HTMLCanvasElement | null) => {
    this.refCanvas = refCanvas;
  };

  handleClickTryAgain = () => this.startGame();

  drawBkgnd(ctx, { width, height, ratio }: TScreenInfo) {
    ctx.save();
    ctx.scale(ratio, ratio);

    // Motion trail
    ctx.fillStyle = '#000';
    ctx.globalAlpha = 0.4;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
  }

  incrementScore = (points: number) => {
    console.log('Game#incrementScore =>', { points });
    if (!this.state.inGame) return;
    this.setState(state => ({ currentScore: state.currentScore + points }));
  };

  initializeActorsMap() {
    this.actorsMap = {
      [ActorType.ships]: [],
      [ActorType.asteroids]: [],
      [ActorType.bullets]: [],
      [ActorType.particles]: [],
    };
  }

  startGame() {
    this.setState({ inGame: true, currentScore: 0 });
    this.initializeActorsMap();
    this.generateShip();
    this.generateAsteroids(this.state.asteroidCount);
  }

  endGame = () => {
    this.setState({ inGame: false });

    // Replace top score
    const { currentScore, topScore } = this.state;
    if (currentScore > topScore) {
      this.setState(
        { topScore: currentScore },
        () => (localStorage['topscore'] = this.state.currentScore)
      );
    }
  };

  updateActorsMap = (actor: IActor) => {
    this.actorsMap[actor.type].push(actor);
  };

  generateShip() {
    const { screenInfo: { width, height } } = this.props;
    const ship = new Ship({
      position: { x: width / 2, y: height / 2 },
      onDie: this.endGame,
      registerActor: this.updateActorsMap,
    });
    console.log('Game#startGame/3', { ship });
    this.updateActorsMap(ship);
  }

  getShipPosition(): TCoord {
    return this.actorsMap[ActorType.ships][0].position;
  }

  generateAsteroid({ width, height }: TScreenInfo, { x, y }: TCoord) {
    const asteroid = new Asteroid({
      size: 80,
      position: {
        x: randomNumBetweenExcluding(0, width, x - 60, x + 60),
        y: randomNumBetweenExcluding(0, height, y - 60, y + 60),
      },
      registerActor: this.updateActorsMap,
      incrementScore: this.incrementScore,
    });
    this.updateActorsMap(asteroid);
  }

  generateAsteroids(howMany: number) {
    const { screenInfo } = this.props;
    const position = this.getShipPosition();
    for (let i = 0; i < howMany; i++) {
      this.generateAsteroid(screenInfo, position);
    }
  }

  tick = () => {
    // console.log('Game#update');
    const ctx = this.refCanvas.getContext('2d');
    const { screenInfo, keyStatus } = this.props;

    this.drawBkgnd(ctx, screenInfo);

    // const ship = this.actorsMap[ActorType.ships][0];

    // Next set of asteroids
    if (this.actorsMap[ActorType.asteroids].length === 0) {
      let count = this.state.asteroidCount + 1;
      this.setState({ asteroidCount: count });
      this.generateAsteroids(count);
    }

    // Check for colisions
    this.checkCollisionsWith(
      this.actorsMap[ActorType.bullets],
      this.actorsMap[ActorType.asteroids]
    );
    this.checkCollisionsWith(
      this.actorsMap[ActorType.ships],
      this.actorsMap[ActorType.asteroids]
    );

    // Remove or render
    this.updateActors(ctx, this.actorsMap[ActorType.particles], ActorType.particles);
    this.updateActors(ctx, this.actorsMap[ActorType.asteroids], ActorType.asteroids);
    this.updateActors(ctx, this.actorsMap[ActorType.bullets], ActorType.bullets);
    this.updateActors(ctx, this.actorsMap[ActorType.ships], ActorType.ships);

    ctx.restore();

    // Next frame
    requestAnimationFrame(this.tick);
  };

  updateActors(ctx: any, actors: IActor[], group: ActorType) {
    actors = actors.filter(actor => !actor.isDeleted);

    let { actorsMap } = this;
    actorsMap = { ...actorsMap, [group]: actors };
    this.actorsMap = actorsMap;

    const { screenInfo, keyStatus } = this.props;
    const renderProps = { ctx, keyStatus, screenInfo };
    actors.forEach(actor => actor.render(renderProps));
  }

  checkCollisionsWith(actors1: IActor[], actors2: IActor[]) {
    for (let a = actors1.length - 1; a > -1; --a) {
      for (let b = actors2.length - 1; b > -1; --b) {
        var actor1 = actors1[a];
        var actor2 = actors2[b];
        if (this.checkCollision(actor1, actor2)) {
          actor1.destroy();
          actor2.destroy();
        }
      }
    }
  }

  checkCollision(actor1: IActor, actor2: IActor) {
    const dx = actor1.position.x - actor2.position.x;
    const dy = actor1.position.y - actor2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < actor1.radius + actor2.radius;
  }

  render() {
    console.log('Game#render');
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
        <Canvas innerRef={this.setRefCanvas} width={width * ratio} height={height * ratio} />
      </div>
    );
  }
}
