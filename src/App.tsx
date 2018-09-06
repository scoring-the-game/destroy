import { TPosition, TVelocity, TScreenInfo, IGameItem, GameItemGroup } from './typedefs';

import * as React from 'react';

import Ship from './Ship';
import Asteroid from './Asteroid';
import Bullet from './Bullet';
import Particle from './Particle';

import { randomNumBetweenExcluding } from './helpers';

const KEY = {
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  A: 65,
  D: 68,
  W: 87,
  SPACE: 32,
};

type TKeys = {
  readonly left: boolean;
  readonly right: boolean;
  readonly up: boolean;
  readonly down: boolean;
  readonly space: boolean;
};

type TGameState = {
  readonly screenInfo: TScreenInfo;
  readonly ctx: any;
  readonly keys: TKeys;
  readonly asteroidCount: number;
  readonly currentScore: number;
  readonly topScore: number;
  readonly inGame: boolean;
};

const defaultKeys: TKeys = {
  left: false,
  right: false,
  up: false,
  down: false,
  space: false,
};

const defaultScreenInfo: TScreenInfo = {
  width: window.innerWidth,
  height: window.innerHeight,
  ratio: window.devicePixelRatio || 1,
};

type TGameItemsMap = { [key in GameItemGroup]: IGameItem[] };

export class App extends React.Component<{}, TGameState> {
  state: TGameState = {
    screenInfo: defaultScreenInfo,
    ctx: null,
    keys: defaultKeys,
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
    console.log('App#componentDidMount');
    this.addListeners();

    const ctx = this.refCanvas.getContext('2d');
    console.log('App#componentDidMount =>', { ctx });
    this.setState({ ctx });
    this.startGame();
    requestAnimationFrame(this.update);
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  refCanvas: HTMLCanvasElement | null = null;
  setRefCanvas = (refCanvas: HTMLCanvasElement | null) => {
    this.refCanvas = refCanvas;
  };

  addListeners() {
    console.log('App#addListeners');
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('resize', this.handleResize);
  }

  removeListeners() {
    console.log('App#removeListeners');
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = e => {
    console.log('App#handleResize');
    const screenInfo = {
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: window.devicePixelRatio || 1,
    };
    this.setState({ screenInfo });
  };

  handleKeys(e, value: boolean) {
    console.log('App#handleKeys');
    const { keyCode } = e;
    let { keys } = this.state;
    if (keyCode === KEY.LEFT || keyCode === KEY.A) keys = { ...keys, left: value };
    if (keyCode === KEY.RIGHT || keyCode === KEY.D) keys = { ...keys, right: value };
    if (keyCode === KEY.UP || keyCode === KEY.W) keys = { ...keys, up: value };
    if (keyCode === KEY.SPACE) keys = { ...keys, space: value };
    this.setState({ keys });
  }

  handleKeyUp = e => this.handleKeys(e, false);
  handleKeyDown = e => this.handleKeys(e, true);

  handleClickTryAgain = () => this.startGame();

  update = () => {
    // console.log('App#update');
    const { ctx, screenInfo, keys } = this.state;
    const ship = this.itemsMap[GameItemGroup.ships][0];

    ctx.save();
    ctx.scale(screenInfo.ratio, screenInfo.ratio);

    // Motion trail
    ctx.fillStyle = '#000';
    ctx.globalAlpha = 0.4;
    ctx.fillRect(0, 0, screenInfo.width, screenInfo.height);
    ctx.globalAlpha = 1;

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
    this.updateObjects(this.itemsMap[GameItemGroup.particles], GameItemGroup.particles);
    this.updateObjects(this.itemsMap[GameItemGroup.asteroids], GameItemGroup.asteroids);
    this.updateObjects(this.itemsMap[GameItemGroup.bullets], GameItemGroup.bullets);
    this.updateObjects(this.itemsMap[GameItemGroup.ships], GameItemGroup.ships);

    ctx.restore();

    // Next frame
    requestAnimationFrame(this.update);
  };

  addScore = (points: number) => {
    console.log('App#addScore =>', { points });
    if (!this.state.inGame) return;
    this.setState(state => ({ currentScore: state.currentScore + points }));
  };

  startGame() {
    console.log('App#startGame');
    this.setState({ inGame: true, currentScore: 0 });
    console.log('App#startGame/1');

    const { screenInfo } = this.state;
    console.log('App#startGame/2', { screenInfo });

    // Make ship
    const ship = new Ship({
      position: { x: screenInfo.width / 2, y: screenInfo.height / 2 },
      create: this.createObject.bind(this),
      onDie: this.gameOver,
    });
    console.log('App#startGame/3', { ship });
    this.createObject(ship, GameItemGroup.ships);
    console.log('App#startGame/4');

    // Make asteroids
    this.itemsMap[GameItemGroup.asteroids] = [];
    console.log('App#startGame/5');
    this.generateAsteroids(this.state.asteroidCount);
    console.log('App#startGame/6');
  }

  gameOver = () => {
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

  createAsteroid({ width, height }: TScreenInfo, { x, y }: TPosition) {
    const asteroid = new Asteroid({
      size: 80,
      position: {
        x: randomNumBetweenExcluding(0, width, x - 60, x + 60),
        y: randomNumBetweenExcluding(0, height, y - 60, y + 60),
      },
      create: this.createObject,
      addScore: this.addScore,
    });
    this.createObject(asteroid, GameItemGroup.asteroids);
  }

  generateAsteroids(howMany: number) {
    const { screenInfo } = this.state;
    const { position } = this.itemsMap[GameItemGroup.ships][0];
    for (let i = 0; i < howMany; i++) {
      this.createAsteroid(screenInfo, position);
    }
  }

  createObject = (item: IGameItem, group: GameItemGroup) => {
    console.log('App#createObject', { item, group });
    let { itemsMap } = this;
    let items = itemsMap[group];
    console.log('App#createObject/1: items =>', items);
    items = [...items, item];
    console.log('App#createObject/2: items =>', items);
    itemsMap = { ...itemsMap, [group]: items };
    console.log('App#createObject/3 =>', itemsMap);
    this.itemsMap = itemsMap;
    console.log('App#createObject/4');
  };

  updateObjects(items: IGameItem[], group: GameItemGroup) {
    items = items.filter(item => !item.isDeleted);

    let { itemsMap } = this;
    itemsMap = { ...itemsMap, [group]: items };
    this.itemsMap = itemsMap;

    items.forEach(item => item.render(this.state));
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

  calcMessage(): string {
    const { currentScore, topScore } = this.state;
    if (currentScore <= 0) return '0 points... So sad.';
    if (currentScore >= topScore) return `Top score with ${currentScore} points. Woo!`;
    return `${currentScore} Points though :)`;
  }

  renderGameOverMessage() {
    const message = this.calcMessage();
    return (
      <div className="endgame">
        <p>Game over, man!</p>
        <p>{message}</p>
        <button onClick={this.handleClickTryAgain}>try again?</button>
      </div>
    );
  }

  renderScore() {
    return (
      <React.Fragment>
        <span className="score current-score">Score: {this.state.currentScore}</span>
        <span className="score top-score">Top Score: {this.state.topScore}</span>
      </React.Fragment>
    );
  }

  renderControls() {
    return (
      <span className="controls">
        Use [A][S][W][D] or [←][↑][↓][→] to MOVE
        <br />
        Use [SPACE] to SHOOT
      </span>
    );
  }

  renderCanvas() {
    const { width, height, ratio } = this.state.screenInfo;
    return <canvas ref={this.setRefCanvas} width={width * ratio} height={height * ratio} />;
  }

  render() {
    console.log('App#render');
    return (
      <div>
        {this.state.inGame ? null : this.renderGameOverMessage()}
        {this.renderScore()}
        {this.renderControls()}
        {this.renderCanvas()}
      </div>
    );
  }
}
