import { TScreenBounds } from '../typedefs';

// -------------------------------------------------------------------------
import * as React from 'react';

// -------------------------------------------------------------------------
export type TScreenBoundsProviderProps = {
  readonly children: (screenBounds: TScreenBounds) => React.ReactNode;
};

// -------------------------------------------------------------------------
const defaultState: TScreenBounds = {
  width: window.innerWidth,
  height: window.innerHeight,
  ratio: window.devicePixelRatio || 1,
};

// -------------------------------------------------------------------------
export class ScreenBoundsProvider extends React.Component<TScreenBoundsProviderProps, TScreenBounds> {
  state: TScreenBounds = defaultState;

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners() {
    // console.log('ScreenBoundsProvider#addListeners');
    window.addEventListener('resize', this.handleResize);
  }

  removeListeners() {
    // console.log('ScreenBoundsProvider#removeListeners');
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = e => {
    // console.log('ScreenBoundsProvider#handleResize');
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: window.devicePixelRatio || 1,
    });
  };

  render() {
    // console.log('ScreenBoundsProvider#render');
    return this.props.children(this.state);
  }
}
