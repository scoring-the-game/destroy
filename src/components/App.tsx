import * as React from 'react';

import { ScreenBoundsProvider } from './ScreenBoundsProvider';
import { KeyStatusProvider } from './KeyStatusProvider';
import { Game } from './Game';

export function App() {
  return (
    <ScreenBoundsProvider>
      {screenBounds => (
        <KeyStatusProvider>
          {keyStatus => <Game screenBounds={screenBounds} keyStatus={keyStatus} />}
        </KeyStatusProvider>
      )}
    </ScreenBoundsProvider>
  );
}
