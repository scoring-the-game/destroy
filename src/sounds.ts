import { Howl, Howler } from 'howler';

import urlSndShoot from '../sfx/shoot.mp3';
import urlSndHit from '../sfx/hit.mp3';
import urlSndDie from '../sfx/die.mp3';
import urlSndRocketThrust from '../sfx/rocket-thrust.mp3';
import urlSndBkgndMain from '../sfx/main-background.mp3';
import urlSndBkgndGameOver from '../sfx/game-over-background.mp3';

const sndShoot = new Howl({ src: [urlSndShoot], autoplay: false, loop: false });
const sndHit = new Howl({ src: [urlSndHit], autoplay: false, loop: false });
const sndDie = new Howl({ src: [urlSndDie], autoplay: false, loop: false });
const sndRocketThrust = new Howl({ src: [urlSndRocketThrust], autoplay: false, loop: false });
const sndBkgndMain = new Howl({ src: [urlSndBkgndMain], autoplay: false, loop: true });
const sndBkgndGameOver = new Howl({
  src: [urlSndBkgndGameOver],
  autoplay: false,
  loop: true,
  volume: 1.0,
});

export function playShoot() {
  console.log('sounds::playShoot');
  setTimeout(() => sndShoot.play(), 0);
}

export function playHit() {
  console.log('sounds::playHit');
  setTimeout(() => sndHit.play(), 0);
}

export function playDie() {
  console.log('sounds::playDie');
  setTimeout(() => sndDie.play(), 0);
}

export function playRocketThrust() {
  console.log('sounds::playRocketThrust');
  setTimeout(() => sndRocketThrust.play(), 0);
}

let bkgndPlaying = null;

export function playBackgroundMain() {
  if (bkgndPlaying === sndBkgndMain) return;
  console.log('sounds::playBackgroundMain');
  if (bkgndPlaying === sndBkgndGameOver) sndBkgndGameOver.stop();
  setTimeout(() => sndBkgndMain.play(), 0);
  bkgndPlaying = sndBkgndMain;
}

export function playBackgroundGameOver() {
  if (bkgndPlaying === sndBkgndGameOver) return;
  console.log('sounds::playBackgroundGameOver');
  if (bkgndPlaying === sndBkgndMain) sndBkgndMain.stop();
  setTimeout(() => sndBkgndGameOver.play(), 0);
  bkgndPlaying = sndBkgndGameOver;
}
