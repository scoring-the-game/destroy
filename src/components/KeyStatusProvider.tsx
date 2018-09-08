import { TKeyStatus } from '../typedefs';

// -------------------------------------------------------------------------
import * as React from 'react';

// -------------------------------------------------------------------------
export type TKeyStatusProviderProps = {
  readonly children: (keyStatus: TKeyStatus) => React.ReactNode;
};

// -------------------------------------------------------------------------
const enum KeyCode {
  space = 32,
  left = 37,
  right = 39,
  up = 38,
  a = 65,
  d = 68,
  w = 87,
}
/*
const KEY = {
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  A: 65,
  D: 68,
  W: 87,
  SPACE: 32,
};
*/
const defaultState: TKeyStatus = {
  left: false,
  right: false,
  up: false,
  down: false,
  space: false,
};

// -------------------------------------------------------------------------
export class KeyStatusProvider extends React.Component<TKeyStatusProviderProps, TKeyStatus> {
  state: TKeyStatus = defaultState;

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners() {
    // console.log('KeyStatusProvider#addListeners');
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  removeListeners() {
    // console.log('KeyStatusProvider#removeListeners');
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeys(e, value: boolean) {
    // console.log('KeyStatusProvider#handleKeys');
    const { keyCode } = e;
    let { state } = this;

    if (keyCode === KeyCode.left || keyCode === KeyCode.a) state = { ...state, left: value };
    if (keyCode === KeyCode.right || keyCode === KeyCode.d) state = { ...state, right: value };
    if (keyCode === KeyCode.up || keyCode === KeyCode.w) state = { ...state, up: value };
    if (keyCode === KeyCode.space) state = { ...state, space: value };

    this.setState(state);
  }

  handleKeyUp = e => this.handleKeys(e, false);
  handleKeyDown = e => this.handleKeys(e, true);

  render() {
    // console.log('KeyStatusProvider#render');
    return this.props.children(this.state);
  }
}
