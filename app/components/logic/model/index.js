import {Observable as O} from 'rx';
import parser from '../lib/syntax/logic-c.jison';

export default (actions) => {
  const parsed$ = actions.input$
    .map(::parser.parse)
  ;

  const c = (e) =>
    O.just(e).concat(parsed$).catch(c)
  ;

  return parsed$.catch(c).startWith("");
}
;
