import * as React from 'react';

import { ScreenInfoProvider } from './ScreenInfoProvider';
import { KeyStatusProvider } from './KeyStatusProvider';
import { Game } from './Game';

export function App() {
  return (
    <ScreenInfoProvider>
      {screenInfo => (
        <KeyStatusProvider>
          {keyStatus => <Game screenInfo={screenInfo} keyStatus={keyStatus} />}
        </KeyStatusProvider>
      )}
    </ScreenInfoProvider>
  );
}
