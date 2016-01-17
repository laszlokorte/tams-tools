start
  = list:expressions EOF {
    return list;
  }
  / EOF {
    return []
  }

operatorMul "binary operator"
  = "and" { return "AND"; }
  / "xor" { return "XOR"; }

operatorAdd "binary operator"
  = "or" { return "OR"; }

operatorUnary "unary operator"
  = "not" { return "NOT"; }

identifierName
  = name:([A-Za-z_][_a-zA-Z0-9]*) {
      return name[0] + name[1].reduce((acc, current) => acc+current, "");
    }

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
  / _ group:group _ { return group; }
  / _ un:unary { return un; }
  / _ id:identifier _ { return id; }

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
