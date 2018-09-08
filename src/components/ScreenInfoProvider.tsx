import { TScreenInfo } from '../typedefs';

// -------------------------------------------------------------------------
import * as React from 'react';

// -------------------------------------------------------------------------
export type TScreenInfoProviderProps = {
  readonly children: (screenInfo: TScreenInfo) => React.ReactNode;
};

// -------------------------------------------------------------------------
const defaultState: TScreenInfo = {
  width: window.innerWidth,
  height: window.innerHeight,
  ratio: window.devicePixelRatio || 1,
};

// -------------------------------------------------------------------------
export class ScreenInfoProvider extends React.Component<TScreenInfoProviderProps, TScreenInfo> {
  state: TScreenInfo = defaultState;

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners() {
    // console.log('ScreenInfoProvider#addListeners');
    window.addEventListener('resize', this.handleResize);
  }

  removeListeners() {
    // console.log('ScreenInfoProvider#removeListeners');
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = e => {
    // console.log('ScreenInfoProvider#handleResize');
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: window.devicePixelRatio || 1,
    });
  };

  render() {
    // console.log('ScreenInfoProvider#render');
    return this.props.children(this.state);
  }
}
