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

logicAnd = "&&" / "&" / "*" / "∧" / "\\wedge"
logicOr = "||" / "|" / "+" / "∨" / "\\vee"
logicXor = "^" / "⊕" / "\\oplus"
logicNot = "!" / "~" / "-" / "¬" / "\\neg" / "\\overline"

logicTop = "true" & noChar / "1" / "T" & noChar / "W" & noChar / "⊤" / "\\top"
logicBottom = "false" & noChar / "0" / "F" & noChar / "⊥" / "\\bot"
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
  = '(' _ content:additive _ ')' {
    return {content: content, style: 1}
  }
  / '\\bigl(' _ content:additive _ '\\bigr)' {
    return {content: content, style: 2}
  }
  / '\\Bigl(' _ content:additive _ '\\Bigr)' {
    return {content: content, style: 3}
  }
  / '\\biggl(' _ content:additive _ '\\biggr)' {
    return {content: content, style: 4}
  }
  / '\\Biggl(' _ content:additive _ '\\Biggr)' {
    return {content: content, style: 5}
  }


angularParens
  = '[' _ content:additive _ ']' {
    return {content: content, style: 6}
  }
  / '\\bigl[' _ content:additive _ '\\bigr]' {
    return {content: content, style: 7}
  }
  / '\\Bigl[' _ content:additive _ '\\Bigr]' {
    return {content: content, style: 8}
  }
  / '\\biggl[' _ content:additive _ '\\biggr]' {
    return {content: content, style: 9}
  }
  / '\\Biggl[' _ content:additive _ '\\Biggr]' {
    return {content: content, style: 10}
  }


  / '\\lbrack' _ content:additive _ '\\rbrack' {
    return {content: content, style: 6}
  }
  / '\\bigl\\lbrack' _ content:additive _ '\\bigr\\rbrack' {
    return {content: content, style: 7}
  }
  / '\\Bigl\\lbrack' _ content:additive _ '\\Bigr\\rbrack' {
    return {content: content, style: 8}
  }
  / '\\biggl\\lbrack' _ content:additive _ '\\biggr\\rbrack' {
    return {content: content, style: 9}
  }
  / '\\Biggl\\lbrack' _ content:additive _ '\\Biggr\\rbrack' {
    return {content: content, style: 10}
  }

curlyParens
  = '{' _ content:additive _ '}' {
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
  = _ name:identifierName _ {
    return name;
  }

labeledExpression
  = name:label _ labelOperator _ content:expression {
    return {
      location: location(),
      node: 'label',
      name: name,
      content: content,
    };
  }
  / content:expression {
    return {
      location: location(),
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
  / vector:literalVector {
    return {node: 'vector', vector: vector};
  }
