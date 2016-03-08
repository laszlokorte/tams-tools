import {
  div, span, textarea, h2,
  select, option,
  label, button,
} from '@cycle/dom';

import {IF} from '../../../../lib/h-helper';

import './index.styl';

const markError = (string, error) => {
  if (!error || !error.location) {
    return [string];
  } else {
    const loc = error.location;
    const start = loc.start.offset;
    const end = loc.end.offset;

    return [
      string.substring(0, start),
      span('.overlay-text-marker.text-marker-error',
        string.substring(start, end) || ' '
      ),
      string.substring(end),
    ];
  }
};

const render = (state) =>
  div('.logic-panel', [
    div('.logic-panel-body', [
      label('.logic-language-chooser',[
        span('.logic-language-chooser-label', 'Language:'),
        select('.syntax-selector',{
          name: 'language',
        }, [
          state.input.langId === 'auto' ?
          option(
            {value: 'auto', selected: true},
            `Auto detect (${state.output.language.name || '???'})`
          ) :
          option(
            {value: 'auto', selected: false},
            `Auto detect`
          ),
          state.languageList.map((item) =>
            option({
              value: item.id,
              selected: state.input.langId === item.id,
            }, item.language.name)
          ).toArray(),
        ]),
      ]),
      IF(state.showCompletion, () =>
        div('.complete-panel',
          state.output.language.completions.map((completion) =>
            button('.completion-button', {
              title: 'Bottom',
              attributes: {
                'data-action-insert': completion,
              },
            }, completion)
          ).toArray()
        )
      ),
      div('.logic-input', [
        textarea('.logic-input-field', {
          value: state.input.string,
          placeholder: 'Enter some logic expression...',
          autocomplete: 'off',
          autocorrect: 'off',
          autocapitalize: 'off',
          spellcheck: false,
        }),
        div('.logic-input-overlay', [
          markError(state.input.string, state.output.error),
        ]),
      ]),

      IF(state.output.error !== null, () => div('.error-box', [
        h2('.error-box-title','Error'),
        div('.error-body',[
          state.output.error.message,
        ]),
      ])),
    ]),
  ])
;

export default (state$) =>
  state$.map(render)
;
