import {div, h1, h3, ul, li, button} from '@cycle/dom';

import examples from '../../model/templates';

const render = () => div([
  h1('.modal-box-title', 'Open...'),
  h3('Examples'),
  ul('.block-list.style-small', [
    examples.map((example) =>
      li([button('.block-button', {
        attributes: {
          'data-open-json': JSON.stringify(example),
        },
      }, example.name)])
    ),
  ]),
])
;

export default (state$) =>
  state$.map(render)
;
