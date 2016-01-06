import {div, h1, h3, ul, li, button, input} from '@cycle/dom';

const examples = [
  {
    name: "Ampel 1",
    data: "blub",
  },
  {
    name: "Ampel 2",
    data: "blub",
  },
  {
    name: "Fahrstuhl 1",
    data: "blub",
  },
  {
    name: "Fahrstuhl 2",
    data: "blub",
  },
];

export default () => div([
  h1('.modal-box-title', 'Open...'),
  h3('Examples'),
  ul('.block-list', [
    examples.map((example) =>
      li([button('.block-button', {
        attributes: {
          'data-open-json': JSON.stringify(example.data),
        },
      }, example.name)])
    ),
  ]),
  h3('From File'),
  div([
    input({type: 'file'}),
  ]),
])
;
