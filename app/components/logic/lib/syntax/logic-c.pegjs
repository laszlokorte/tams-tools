start
  = list:expressions EOF {
    return list;
  }
  / _ EOF {
    return []
  }

labelOperator "labelOperator"
  = "="

logicAnd = "&&" / "&"
logicOr = "||" / "|"
logicXor = "^"
logicNot = "!" / "~"

logicTop = "true" / "1"
logicBottom = "false" / "0"

operatorMul "binary operator"
  = logicAnd { return "AND"; }
  / logicXor { return "XOR"; }

operatorAdd "binary operator"
  = logicOr { return "OR"; }

operatorUnary "unary operator"
  = logicNot { return "NOT"; }

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
    / [^"]

charNoSingleQuote
  = charEscapeSequence
    / [^']

charEscapeSequence
  = "\\\\"    { return "\\"; }
    / "\\'"   { return "'";  }
    / '\\"'   { return '"';  }

literalValue
  = logicTop { return true; }
  / logicBottom { return false; }

parentheses
  = "(" _ content:additive _ ")" {
    return {content: content, style: 1}
  }

expressionSeparator "expression separator"
  = ","

EOF "end of input"
  = !.

_ "whitespace"
  = [ \t\n\r]*

expressions
  = head:labeledExpression _ tail:(expressionSeparator _ labeledExpression)+ {
    return [head, ...tail.map((t) => t[2])];
  }
  / head:labeledExpression {
    return [head];
  }

label "expressionLabel"
  = identifierName

labeledExpression
  = name:label _ labelOperator _ content:expression {
    return {
      node: 'label',
      name: name,
      content: content,
    };
  }
  / content:expression {
    return {
      node: 'label',
      name: null,
      content: content,
    };
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

group
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
