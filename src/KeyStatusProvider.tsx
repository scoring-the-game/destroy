import * as React from 'react';

import { TKeyStatus } from './typedefs';

export type TKeyStatusProviderProps = {
  readonly children: (keyStatus: TKeyStatus) => React.ReactNode;
};

const KEY = {
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  A: 65,
  D: 68,
  W: 87,
  SPACE: 32,
};

const defaultState: TKeyStatus = {
  left: false,
  right: false,
  up: false,
  down: false,
  space: false,
};

export class KeyStatusProvider extends React.Component<TKeyStatusProviderProps, TKeyStatus> {
  state: TKeyStatus = defaultState;

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners() {
    console.log('KeyStatusProvider#addListeners');
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  removeListeners() {
    console.log('KeyStatusProvider#removeListeners');
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeys(e, value: boolean) {
    console.log('KeyStatusProvider#handleKeys');
    const { keyCode } = e;
    let { state } = this;

    if (keyCode === KEY.LEFT || keyCode === KEY.A) state = { ...state, left: value };
    if (keyCode === KEY.RIGHT || keyCode === KEY.D) state = { ...state, right: value };
    if (keyCode === KEY.UP || keyCode === KEY.W) state = { ...state, up: value };
    if (keyCode === KEY.SPACE) state = { ...state, space: value };

    this.setState(state);
  }

  handleKeyUp = e => this.handleKeys(e, false);
  handleKeyDown = e => this.handleKeys(e, true);

  render() {
    console.log('KeyStatusProvider#render');
    return this.props.children(this.state);
  }
}
