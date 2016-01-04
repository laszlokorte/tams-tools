import './styles/layout.styl';

import html from 'raw!./layout.html';

document.getElementById('app').innerHTML = html;

const canvas = document.getElementById('canvas');
document.getElementById('canvas-toggle')
  .addEventListener('mousedown', (evt) => {
    evt.preventDefault();

    canvas.classList.toggle('state-closed');
  });

const editModeButtons = document.querySelectorAll('.edit-mode');
const editButtons =
  document.querySelectorAll('.thumbnail-action, #add-output, .overlay-item');
const modeBar = document.getElementById('mode-bar');
document.getElementById('edit-function').addEventListener('click', (evt) => {
  evt.preventDefault();

  modeBar.classList.toggle('state-collapsed');
  Array.prototype.forEach.call(editButtons, (e) => {
    e.classList.toggle('state-hidden');
  });
  Array.prototype.forEach.call(editModeButtons, (e) => {
    e.classList.toggle('state-collapsed');
  });
});

document.getElementById('edit-loops').addEventListener('click', (evt) => {
  evt.preventDefault();

  modeBar.classList.toggle('state-collapsed');
  Array.prototype.forEach.call(editButtons, (e) => {
    e.classList.toggle('state-hidden');
  });
  Array.prototype.forEach.call(editModeButtons, (e) => {
    e.classList.toggle('state-collapsed');
  });
});
