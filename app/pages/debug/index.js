import Cycle from '@cycle/core';
import isolate from '@cycle/isolate';
import {makeDOMDriver, div} from '@cycle/dom';
import {Observable as O} from 'rx';

/*
  This file is just used as playground
  to reconstruct some error cases separated from
  the application
*/

const Canvas = ({DOM, content$}) => {
  const intent = (D) => {
    const el = D.select('.clickableBackground');

    return ({
      toggle$: el
        .events('click')
        .map(() => true),
    });
  }
  ;

  const render = (state) =>
    div('.clickableBackground', {
      attributes: {
        style: `position: relative;
      width: 500px; height: 500px;
      background: ${state.active ? 'darkred' : 'darkblue'}`,
      },
    }, [
      state.content,
    ])
  ;

  const view = (state$) =>
    state$.map((state) => div([render(state)]))
  ;

  const model = (cont$, actions) =>
    O.combineLatest(
      actions.toggle$
        .startWith(true)
        .scan((prev) => !prev),
      cont$,
      (active, content) => ({
        active,
        content,
      })
    )
  ;

  const actions = intent(DOM);
  const state$ = model(content$, actions);
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
  };
};

const Drawing = ({DOM}) => {
  const intent = (D) => {
    const el = D.select('.clickableRect');

    return ({
      toggle$: el
        .events('click')
        // we can stop the propagation to prevent
        // the Canvas(outer) from getting click events
        // which happen in the inner:
        //
        //.do((e) => e.stopPropagation())
        .map(() => true),
    })
  ;
  };

  const render = (state) =>
    div('.clickableRect', {
      attributes: {
        style: `position: absolute;
      left: ${state.pos.x}px;
      top: ${state.pos.y}px;
      width: 100px; height: 100px;
      background: ${state.active ? 'black' : 'white'}`,
      },
    }, ' ')
  ;

  const view = (state$) =>
    state$.map((state) => div([render(state)]))
  ;

  const model = (pos$, actions) =>
    pos$.map((pos) =>
      actions.toggle$
        .startWith(true)
        .scan((prev) => !prev)
        .map((active) => ({
          pos,
          active,
        }))
    ).switch()
    .shareReplay(1)
  ;

  const {isolateSource, isolateSink} = DOM;

  const actions = intent(
    isolateSource(DOM, 'moreIsolation'));
  const state$ = model(O.just({x: 23, y: 42}), actions);
  const innerVTree$ = view(state$);

  const outerVTree$ = isolate(Canvas, 'myCanvas')({
    DOM,
    content$: isolateSink(innerVTree$, 'moreIsolation'),
  }).DOM;

  return {
    // Without the additional wrapper div,
    // the Canvas (which owns the outerVTree)
    // does not get any events:
    // DOM: outerVTree$,

    // With the wrapper div both Canvas and
    // Drawing get their events.
    // Canvas(outer) get's the events of the Drawing(inner)
    // aswell. Not sure if it is desired, but stopPropagation
    // can be used to prevent it (see line 60)
    DOM: O.just(div(outerVTree$)),
  };
};

const main = ({DOM}) => {
  return {
    DOM: isolate(Drawing, 'myDrawing')({DOM}).DOM,
  };
};

const drivers = {
  DOM: makeDOMDriver('#app'),
};

Cycle.run(main, drivers);
