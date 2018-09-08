import * as React from 'react';

export type TGameOverMessageProps = {
  readonly currentScore: number;
  readonly topScore: number;
  readonly onClickTryAgain: () => void;
};

function calcMessage({ currentScore, topScore }: TGameOverMessageProps): string {
  if (currentScore <= 0) return '0 points... So sad.';
  if (currentScore >= topScore) return `Top score with ${currentScore} points. Woo!`;
  return `${currentScore} Points though :)`;
}

export function GameOverMessage(props: TGameOverMessageProps) {
  const message = calcMessage(props);
  return (
    <div className="endgame">
      <p>Game over, man!</p>
      <p>{message}</p>
      <button onClick={props.onClickTryAgain}>try again?</button>
    </div>
  );
}
