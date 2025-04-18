import Game from './game';

window.addEventListener('load', () => {
  const canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
  const uiText = document.getElementById('text') as HTMLDivElement;
  const uiHistory = document.getElementById('history') as HTMLDivElement;
  const uiWPM = document.getElementById('wpm') as HTMLDivElement;
  const game = new Game(canvas, uiText, uiHistory, uiWPM);
  game.start();
});
