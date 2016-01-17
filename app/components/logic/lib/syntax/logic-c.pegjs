start
  = list:expressions EOF {
    return list;
  }
  / EOF {
    return []
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

operatorMul "binary operator"
  = "&" { return "AND"; }
  / "^" { return "XOR"; }

operatorAdd "binary operator"
  = "|" { return "OR"; }

operatorUnary "unary operator"
  = "!" { return "NOT"; }

identifierName
  = name:([A-Za-z_][_a-zA-Z0-9]*) {
      return name[0] + name[1].reduce((acc, current) => acc+current, "");
    }

literalValue
  = "true" { return true; }
  / "false" { return false; }

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
  = "(" _ additive:additive _ ")" {
    return {node: 'group', content: additive, style: 1};
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
