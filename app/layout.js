import './styles/layout.styl';

import html from 'raw!./layout.html';

document.getElementById('app').innerHTML = html;

const canvas = document.getElementById('canvas');
document.getElementById('canvas-toggle').addEventListener('mousedown', (evt) => {
  evt.preventDefault();

  canvas.classList.toggle('state-closed');
});
