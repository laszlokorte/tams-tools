start
  = list:expressions EOF {
    return list;
  }
  / _ EOF {
    return []
  }

labelOperator "labelOperator"
  = "="

noChar = [^0-9A-Za-z_-] / EOF

logicAnd = "&&" / "&" / "*" / "∧" / "\\wedge" & noChar
logicOr = "||" / "|" / "+" / "∨" / "\\vee" & noChar
logicXor = "^" / "⊕" / "\\oplus" & noChar
logicNot = "!" / "~" / "-" / "¬" / "\\neg" & noChar / "\\overline" & noChar

logicTop = "true" & noChar / "1" / "T" & noChar / "W" & noChar / "⊤" / "\\top" & noChar
logicBottom = "false" & noChar / "0" / "F" & noChar / "⊥" / "\\bot" & noChar
logicUndefined = "\\nothing" & noChar

vectorStart = "<"
vectorEnd = ">"

operatorMul "binary operator"
  = logicAnd { return "AND"; }
  / logicXor { return "XOR"; }

operatorAdd "binary operator"
  = logicOr { return "OR"; }

operatorUnary "unary operator"
  = logicNot { return "NOT"; }

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
  / logicUndefined { return null; }


vectorHead
  = head:identifier _ tail:(expressionSeparator _ identifier)+ {
    return [head, ...tail.map((t) => t[2])];
  }
  / head:identifier {
    return [head];
  }

vectorValue
  = "1" { return true; }
  / "0" { return false; }
  / "*" { return null; }

vectorBody "vectorBody"
  = values:vectorValue*

literalVector
  = vectorStart _ head:vectorHead _ ":" _ body:vectorBody _ vectorEnd {
    var idCount = head.length;
    var expectedSize = Math.pow(2,idCount);
    if(expectedSize !== body.length) {
      expected("Vector with "+idCount+" identifers to have " + expectedSize + " values.", "x");
    }

    return {
      identifiers: head,
      values: body
    };
  }



parentheses
  = roundParens
  / angularParens
/// curlyParens


roundParens
  = '(' _ body:additive _ ')' {
    return {body: body, style: 1}
  }
  / '\\bigl(' _ body:additive _ '\\bigr)' {
    return {body: body, style: 2}
  }
  / '\\Bigl(' _ body:additive _ '\\Bigr)' {
    return {body: body, style: 3}
  }
  / '\\biggl(' _ body:additive _ '\\biggr)' {
    return {body: body, style: 4}
  }
  / '\\Biggl(' _ body:additive _ '\\Biggr)' {
    return {body: body, style: 5}
  }


angularParens
  = '[' _ body:additive _ ']' {
    return {body: body, style: 6}
  }
  / '\\bigl[' _ body:additive _ '\\bigr]' {
    return {body: body, style: 7}
  }
  / '\\Bigl[' _ body:additive _ '\\Bigr]' {
    return {body: body, style: 8}
  }
  / '\\biggl[' _ body:additive _ '\\biggr]' {
    return {body: body, style: 9}
  }
  / '\\Biggl[' _ body:additive _ '\\Biggr]' {
    return {body: body, style: 10}
  }


  / '\\lbrack' _ body:additive _ '\\rbrack' {
    return {body: body, style: 6}
  }
  / '\\bigl\\lbrack' _ body:additive _ '\\bigr\\rbrack' {
    return {body: body, style: 7}
  }
  / '\\Bigl\\lbrack' _ body:additive _ '\\Bigr\\rbrack' {
    return {body: body, style: 8}
  }
  / '\\biggl\\lbrack' _ body:additive _ '\\biggr\\rbrack' {
    return {body: body, style: 9}
  }
  / '\\Biggl\\lbrack' _ body:additive _ '\\Biggr\\rbrack' {
    return {body: body, style: 10}
  }

curlyParens
  = '{' _ body:additive _ '}' {
    return {body: body, style: 1}
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
  = _ name:identifierName _ {
    return name;
  }

labeledExpression
  = name:label _ labelOperator _ body:expression {
    return {
      location: location(),
      node: 'label',
      name: name,
      body: body,
    };
  }
  / body:expression {
    return {
      location: location(),
      node: 'label',
      name: null,
      body: body,
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
  = first:primary _ rest:(operatorMul? _ primary)+ {
    return rest.reduce(function(memo, curr) {
      return {node: 'binary', operator: curr[0] || "AND", lhs: memo, rhs: curr[2]};
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
    return {node: 'group', body: paren.body, style: paren.style};
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
  / vector:literalVector {
    return {node: 'vector', vector: vector};
  }
