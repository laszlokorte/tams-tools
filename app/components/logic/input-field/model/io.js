import I from 'immutable';

// an object representing an input to the parser pipeline
export const input = I.Record({
  langId: 'auto', // the id of the language to be used for parsing
  string: '', // the string to be parsed
}, 'input');

// an object representing the result of parsing and analyzing
export const output = I.Record({
  language: null, // the language the string has been parsed with
  network: null, // the network object containing the results of parsing
  error: null, // the error that occured during parsing
}, 'output');

// an object representing a parsing or analysing error
export const error = I.Record({
  message: null, // The error message as string
  location: null, // the location in the input string at which
                  // the error occured
}, 'error');
