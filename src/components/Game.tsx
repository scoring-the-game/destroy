import {
  TCoord,
  TVelocity,
  TScreenInfo,
  IGameItem,
  GameItemType,
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

type TGameItemsMap = { [key in GameItemType]: IGameItem[] };

// -------------------------------------------------------------------------
export class Game extends React.Component<TGameProps, TGameState> {
  state: TGameState = {
    asteroidCount: 3,
    currentScore: 0,
    topScore: localStorage['topscore'] || 0,
    inGame: false,
  };

  itemsMap: TGameItemsMap;

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

  initializeItemsMap() {
    this.itemsMap = {
      [GameItemType.ships]: [],
      [GameItemType.asteroids]: [],
      [GameItemType.bullets]: [],
      [GameItemType.particles]: [],
    };
  }

  startGame() {
    this.setState({ inGame: true, currentScore: 0 });
    this.initializeItemsMap();
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

  updateItemsMap = (item: IGameItem) => {
    this.itemsMap[item.type].push(item);
  };

  generateShip() {
    const { screenInfo: { width, height } } = this.props;
    const ship = new Ship({
      position: { x: width / 2, y: height / 2 },
      registerItem: this.updateItemsMap,
      onDie: this.endGame,
    });
    console.log('Game#startGame/3', { ship });
    this.updateItemsMap(ship);
  }

  generateAsteroid({ width, height }: TScreenInfo, { x, y }: TCoord) {
    const asteroid = new Asteroid({
      size: 80,
      position: {
        x: randomNumBetweenExcluding(0, width, x - 60, x + 60),
        y: randomNumBetweenExcluding(0, height, y - 60, y + 60),
      },
      registerItem: this.updateItemsMap,
      incrementScore: this.incrementScore,
    });
    this.updateItemsMap(asteroid);
  }

  generateAsteroids(howMany: number) {
    const { screenInfo } = this.props;
    const { position } = this.itemsMap[GameItemType.ships][0];
    for (let i = 0; i < howMany; i++) {
      this.generateAsteroid(screenInfo, position);
    }
  }

  tick = () => {
    // console.log('Game#update');
    const ctx = this.refCanvas.getContext('2d');
    const { screenInfo, keyStatus } = this.props;

    this.drawBkgnd(ctx, screenInfo);

    // const ship = this.itemsMap[GameItemType.ships][0];

    // Next set of asteroids
    if (this.itemsMap[GameItemType.asteroids].length === 0) {
      let count = this.state.asteroidCount + 1;
      this.setState({ asteroidCount: count });
      this.generateAsteroids(count);
    }

    // Check for colisions
    this.checkCollisionsWith(
      this.itemsMap[GameItemType.bullets],
      this.itemsMap[GameItemType.asteroids]
    );
    this.checkCollisionsWith(
      this.itemsMap[GameItemType.ships],
      this.itemsMap[GameItemType.asteroids]
    );

    // Remove or render
    this.updateObjects(ctx, this.itemsMap[GameItemType.particles], GameItemType.particles);
    this.updateObjects(ctx, this.itemsMap[GameItemType.asteroids], GameItemType.asteroids);
    this.updateObjects(ctx, this.itemsMap[GameItemType.bullets], GameItemType.bullets);
    this.updateObjects(ctx, this.itemsMap[GameItemType.ships], GameItemType.ships);

    ctx.restore();

    // Next frame
    requestAnimationFrame(this.tick);
  };

  updateObjects(ctx: any, items: IGameItem[], group: GameItemType) {
    items = items.filter(item => !item.isDeleted);

    let { itemsMap } = this;
    itemsMap = { ...itemsMap, [group]: items };
    this.itemsMap = itemsMap;

    const { screenInfo, keyStatus } = this.props;
    const renderProps = { ctx, keyStatus, screenInfo };
    items.forEach(item => item.render(renderProps));
  }

  checkCollisionsWith(items1: IGameItem[], items2: IGameItem[]) {
    for (let a = items1.length - 1; a > -1; --a) {
      for (let b = items2.length - 1; b > -1; --b) {
        var item1 = items1[a];
        var item2 = items2[b];
        if (this.checkCollision(item1, item2)) {
          item1.destroy();
          item2.destroy();
        }
      }
    }
  }

  checkCollision(obj1: IGameItem, obj2: IGameItem) {
    const dx = obj1.position.x - obj2.position.x;
    const dy = obj1.position.y - obj2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < obj1.radius + obj2.radius;
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
