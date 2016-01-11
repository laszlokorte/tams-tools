import {Observable as O} from 'rx';
import lexer from '../lib/parser/lexer';

export default (actions) =>
  actions.input$
    .map((string) => lexer(string))
    .map((token$) =>
      token$.scan((acc, token) => acc.concat([token.value]), [])
    )
    .switch()
    .startWith([])
;
