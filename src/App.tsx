import * as React from 'react';

import { ScreenInfoProvider } from './ScreenInfoProvider';
import { Game } from './Game';

export function App() {
  return <ScreenInfoProvider>{screenInfo => <Game screenInfo={screenInfo} />}</ScreenInfoProvider>;
}
