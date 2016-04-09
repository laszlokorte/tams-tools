import {div, h1, h3, a} from '@cycle/dom';

const render = ({json}) => div([
  h1('.modal-box-title', 'Export...'),
  h3('JSON'),
  div([
    a('.block-button',{
      href: URL.createObjectURL(
        new Blob([json.toString()], {type: 'text/json'})
      ),
      attributes: {
        'data-download': 'json',
        download: 'kv-diagram.json',
      },
    }, 'Save...'),
  ]),
])
;

export default (state$) =>
  state$.map((state) => render(state))
;
