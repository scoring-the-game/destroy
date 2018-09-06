import * as React from 'react';

export type TCanvasProps = {
  readonly width: number;
  readonly height: number;
  readonly innerRef: (ref: HTMLCanvasElement | null) => void;
};

export function Canvas({ width, height, innerRef }: TCanvasProps) {
  return <canvas ref={innerRef} width={width} height={height} />;
}
