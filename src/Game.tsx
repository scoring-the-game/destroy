import {
  TPosition,
  TVelocity,
  TScreenInfo,
  IGameItem,
  GameItemGroup,
  TKeyStatus,
} from './typedefs';

// -------------------------------------------------------------------------
import * as React from 'react';

import Ship from './Ship';
import Asteroid from './Asteroid';
import Bullet from './Bullet';
import Particle from './Particle';

import { Scoreboard } from './Scoreboard';
import { GameOverMessage } from './GameOverMessage';
import { Controls } from './Controls';
import { Canvas } from './Canvas';

import { randomNumBetweenExcluding } from './helpers';

// -------------------------------------------------------------------------
type TGameProps = {
  readonly screenInfo: TScreenInfo;
};

type TGameState = {
  readonly keyStatus: TKeyStatus;
  readonly asteroidCount: number;
  readonly currentScore: number;
  readonly topScore: number;
  readonly inGame: boolean;
};

type TGameItemsMap = { [key in GameItemGroup]: IGameItem[] };

// -------------------------------------------------------------------------
const KEY = {
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  A: 65,
  D: 68,
  W: 87,
  SPACE: 32,
};

const defaultKeyStatus: TKeyStatus = {
  left: false,
  right: false,
  up: false,
  down: false,
  space: false,
};

// -------------------------------------------------------------------------
export class Game extends React.Component<TGameProps, TGameState> {
  state: TGameState = {
    keyStatus: defaultKeyStatus,
    asteroidCount: 3,
    currentScore: 0,
    topScore: localStorage['topscore'] || 0,
    inGame: false,
  };

  itemsMap: TGameItemsMap = {
    [GameItemGroup.ships]: [],
    [GameItemGroup.asteroids]: [],
    [GameItemGroup.bullets]: [],
    [GameItemGroup.particles]: [],
  };

  componentDidMount() {
    console.log('Game#componentDidMount');
    this.addListeners();

    this.startGame();
    requestAnimationFrame(this.tick);
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  refCanvas: HTMLCanvasElement | null = null;
  setRefCanvas = (refCanvas: HTMLCanvasElement | null) => {
    this.refCanvas = refCanvas;
  };

  addListeners() {
    console.log('Game#addListeners');
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  removeListeners() {
    console.log('Game#removeListeners');
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeys(e, value: boolean) {
    console.log('Game#handleKeys');
    const { keyCode } = e;
    let { keyStatus } = this.state;
    if (keyCode === KEY.LEFT || keyCode === KEY.A) keyStatus = { ...keyStatus, left: value };
    if (keyCode === KEY.RIGHT || keyCode === KEY.D) keyStatus = { ...keyStatus, right: value };
    if (keyCode === KEY.UP || keyCode === KEY.W) keyStatus = { ...keyStatus, up: value };
    if (keyCode === KEY.SPACE) keyStatus = { ...keyStatus, space: value };
    this.setState({ keyStatus });
  }

  handleKeyUp = e => this.handleKeys(e, false);
  handleKeyDown = e => this.handleKeys(e, true);

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

  startGame() {
    this.setState({ inGame: true, currentScore: 0 });

    this.itemsMap[GameItemGroup.asteroids] = [];

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

  createObject = (item: IGameItem, group: GameItemGroup) => {
    console.log('Game#createObject', { item, group });
    let { itemsMap } = this;
    let items = itemsMap[group];
    console.log('Game#createObject/1: items =>', items);
    items = [...items, item];
    console.log('Game#createObject/2: items =>', items);
    itemsMap = { ...itemsMap, [group]: items };
    console.log('Game#createObject/3 =>', itemsMap);
    this.itemsMap = itemsMap;
    console.log('Game#createObject/4');
  };

  generateShip() {
    const {
      screenInfo: { width, height },
    } = this.props;
    const ship = new Ship({
      position: { x: width / 2, y: height / 2 },
      create: this.createObject,
      onDie: this.endGame,
    });
    console.log('Game#startGame/3', { ship });
    this.createObject(ship, GameItemGroup.ships);
  }

  generateAsteroid({ width, height }: TScreenInfo, { x, y }: TPosition) {
    const asteroid = new Asteroid({
      size: 80,
      position: {
        x: randomNumBetweenExcluding(0, width, x - 60, x + 60),
        y: randomNumBetweenExcluding(0, height, y - 60, y + 60),
      },
      create: this.createObject,
      incrementScore: this.incrementScore,
    });
    this.createObject(asteroid, GameItemGroup.asteroids);
  }

  generateAsteroids(howMany: number) {
    const { screenInfo } = this.props;
    const { position } = this.itemsMap[GameItemGroup.ships][0];
    for (let i = 0; i < howMany; i++) {
      this.generateAsteroid(screenInfo, position);
    }
  }

  tick = () => {
    // console.log('Game#update');
    const ctx = this.refCanvas.getContext('2d');
    const { screenInfo } = this.props;
    const { keyStatus } = this.state;

    this.drawBkgnd(ctx, screenInfo);

    // const ship = this.itemsMap[GameItemGroup.ships][0];

    // Next set of asteroids
    if (this.itemsMap[GameItemGroup.asteroids].length === 0) {
      let count = this.state.asteroidCount + 1;
      this.setState({ asteroidCount: count });
      this.generateAsteroids(count);
    }

    // Check for colisions
    this.checkCollisionsWith(
      this.itemsMap[GameItemGroup.bullets],
      this.itemsMap[GameItemGroup.asteroids]
    );
    this.checkCollisionsWith(
      this.itemsMap[GameItemGroup.ships],
      this.itemsMap[GameItemGroup.asteroids]
    );

    // Remove or render
    this.updateObjects(ctx, this.itemsMap[GameItemGroup.particles], GameItemGroup.particles);
    this.updateObjects(ctx, this.itemsMap[GameItemGroup.asteroids], GameItemGroup.asteroids);
    this.updateObjects(ctx, this.itemsMap[GameItemGroup.bullets], GameItemGroup.bullets);
    this.updateObjects(ctx, this.itemsMap[GameItemGroup.ships], GameItemGroup.ships);

    ctx.restore();

    // Next frame
    requestAnimationFrame(this.tick);
  };

  updateObjects(ctx: any, items: IGameItem[], group: GameItemGroup) {
    items = items.filter(item => !item.isDeleted);

    let { itemsMap } = this;
    itemsMap = { ...itemsMap, [group]: items };
    this.itemsMap = itemsMap;

    const { screenInfo } = this.props;
    const { keyStatus } = this.state;
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
    const {
      screenInfo: { width, height, ratio },
    } = this.props;
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
