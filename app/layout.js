import './styles/layout.styl';

/*
  This file is the entry point for the layout preview
  It just outputs the content of layout.html
  and load the layout stylesheet
*/

import html from 'raw!./layout.html';

document.getElementById('app').innerHTML = html;
