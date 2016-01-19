start
  = list:expressions EOF {
    return list;
  }
  / _ EOF {
    return []
  }

logicAnd = "and"
logicOr = "or"
logicXor = "xor"
logicNot = "not"

logicTop = "true" / "1" / "T" / "W"
logicBottom = "false" / "0" / "F"

operatorMul "binary operator"
  = logicAnd { return "AND"; }
  / logicXor { return "XOR"; }

operatorAdd "binary operator"
  = logicOr { return "OR"; }

operatorUnary "unary operator"
  = logicNot { return "NOT"; }

identifierName
  = name:([A-Za-z_][_a-zA-Z0-9]*) {
      return name[0] + name[1].reduce((acc, current) => acc+current, "");
    }

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
  / _ group:group _ { return group; }
  / _ un:unary { return un; }
  / _ id:identifier _ { return id; }

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
