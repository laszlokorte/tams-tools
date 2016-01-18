start
  = list:expressions EOF {
    return list;
  }
  / EOF {
    return []
  }

operatorMul "binary operator"
  = "\\wedge"    { return "AND"; }
  / "\\oplus"    { return "XOR"; }
  / ""           { return "AND"; }
  / "+"          { return "XOR"; }

operatorAdd "binary operator"
  = "\\vee"      { return "OR"; }

operatorUnary "unary operator"
  = "\\neg"      { return "NOT"; }
  / "\\overline" { return "NOT"; }


identifierName
  = first:[A-Za-z_] tail:[\-_a-zA-Z0-9\{\}]* {
      return first + tail.join("");
    }
  / '"' chars:charNoDoubleQuote+ '"' {
      return chars.join("");
    }
  / "'" chars:charNoSingleQuote+ "'" {
      return chars.join("");
    }

charNoDoubleQuote
  = charEscapeSequence
    / '""' { return '"'; }
    / [^"]

charNoSingleQuote
  = charEscapeSequence
    / "''" { return "'"; }
    / [^']

charEscapeSequence
  = "\\\\"    { return "\\"; }
    / "\\'"   { return "'";  }
    / '\\"'   { return '"';  }

literalValue
  // top
  = "true" { return true; }
  / "1" { return true; }
  / "W" { return true; }
  / "T" { return true; }
  // bottom
  / "false" { return false; }
  / "0" { return false; }
  / "F" { return false; }


parentheses
  = roundParens
  / angularParens


roundParens
  = '(' _ content:additive _ ')' {
    return {content: content, style: 1}
  }
  / '\\bigl(' _ content:additive _ '\\bigr)' {
    return {content: content, style: 1}
  }
  / '\\Bigl(' _ content:additive _ '\\Bigr)' {
    return {content: content, style: 1}
  }
  / '\\biggl(' _ content:additive _ '\\biggr)' {
    return {content: content, style: 1}
  }
  / '\\Biggl(' _ content:additive _ '\\Biggr)' {
    return {content: content, style: 1}
  }


angularParens
  = '[' _ content:additive _ ']' {
    return {content: content, style: 1}
  }
  / '\\bigl[' _ content:additive _ '\\bigr]' {
    return {content: content, style: 1}
  }
  / '\\Bigl[' _ content:additive _ '\\Bigr]' {
    return {content: content, style: 1}
  }
  / '\\biggl[' _ content:additive _ '\\biggr]' {
    return {content: content, style: 1}
  }
  / '\\Biggl[' _ content:additive _ '\\Biggr]' {
    return {content: content, style: 1}
  }


  / '\\lbrack' _ content:additive _ '\\rbrack' {
    return {content: content, style: 1}
  }
  / '\\bigl\\lbrack' _ content:additive _ '\\bigr\\rbrack' {
    return {content: content, style: 1}
  }
  / '\\Bigl\\lbrack' _ content:additive _ '\\Bigr\\rbrack' {
    return {content: content, style: 1}
  }
  / '\\biggl\\lbrack' _ content:additive _ '\\biggr\\rbrack' {
    return {content: content, style: 1}
  }
  / '\\Biggl\\lbrack' _ content:additive _ '\\Biggr\\rbrack' {
    return {content: content, style: 1}
  }

expressionSeparator "expression separator"
  = ","

EOF
  = !.

_ "whitespace"
  = [ \t\n\r]*

expressions
  = head:expression tail:(expressionSeparator expression)+ {
    return [head, ...tail.map((t) => t[1])];
  }
  / head:expression {
    return [head];
  }

expression = additive

additive
  = first:multiplicative _ rest:(operatorAdd _ multiplicative)+ {
    return rest.reduce(function(memo, curr) {
      return {node: 'binary', operator: curr[0], lhs: memo, rhs: curr[2]};
    }, first);
  }
  / multiplicative

multiplicative
  = first:primary _ rest:(operatorMul _ primary)+ {
    return rest.reduce(function(memo, curr) {
      return {node: 'binary', operator: curr[0], lhs: memo, rhs: curr[2]};
    }, first);
  }
  / primary

primary
  = _ lit:literal _ { return lit; }
  / _ id:identifier _ { return id; }
  / _ group:group _ { return group; }
  / _ un:unary { return un; }

group "group"
  = paren:parentheses {
    return {node: 'group', content: paren.content, style: paren.style};
  }

unary
  = op:operatorUnary _ primary:primary {
    return {node: 'unary', operator: op, operand: primary};
  }

identifier "identifier"
  = name:identifierName {
    return {node: 'identifier', name: name}
  }

literal "literal"
  = value:literalValue {
    return {node: 'constant', value: value};
  }
