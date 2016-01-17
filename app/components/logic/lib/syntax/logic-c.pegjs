start
  = list:expressions EOF {
    return list;
  }
  / EOF {
    return []
  }

operatorMul "binary operator"
  = "&&" { return "AND"; }
  / "&" { return "AND"; }
  / "^" { return "XOR"; }

operatorAdd "binary operator"
  = "||" { return "OR"; }
  / "|" { return "OR"; }

operatorUnary "unary operator"
  = "!" { return "NOT"; }
  / "~" { return "NOT"; }

identifierName
  = first:[A-Za-z_] tail:[\-_a-zA-Z0-9]* {
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
  = "(" _ content:additive _ ")" {
    return {content: content, style: 1}
  }

EOF
  = !.

_ "whitespace"
  = [ \t\n\r]*

expressions
  = head:expression tail:("," expression)+ {
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
