import * as React from 'react';

export type TScoreboardProps = {
  readonly currentScore: number;
  readonly topScore: number;
};

export function Scoreboard({ currentScore, topScore }: TScoreboardProps) {
  return (
    <React.Fragment>
      <span className="score current-score">Score: {currentScore}</span>
      <span className="score top-score">Top Score: {topScore}</span>
    </React.Fragment>
  );
}
