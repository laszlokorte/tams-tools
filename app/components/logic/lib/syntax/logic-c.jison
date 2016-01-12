/* lexical grammar */
%lex
%%
\s+                       {/* skip whitespace */}
"1"                       {return 'TRUE';}
"0"                       {return 'FALSE';}
[A-Za-z][_A-Za-z0-9]*\b   {return 'IDENTIFIER';}
"&"                       {return 'AND';}
"|"                       {return 'OR';}
"^"                       {return 'XOR';}
"!"                       {return 'NOT';}
"("                       {return '(';}
")"                       {return ')';}
<<EOF>>                   {return 'EOF';}

/lex

/* operator associations and precedence */

%left 'AND'
%left 'OR'
%left 'XOR'
%left 'NOT'

%start expressions

%% /* language grammar */

expressions
    : e EOF
        {return $1;}
    | EOF
        {return null;}
    ;

e
    : e 'AND' e
        {$$ = {operator: 'AND', lhs: $1, rhs: $3};}
    | e 'OR' e
        {$$ = {operator: 'OR', lhs: $1, rhs: $3};}
    | e 'XOR' e
        {$$ = {operator: 'XOR', lhs: $1, rhs: $3};}
    | 'NOT' e
        {$$ = {operator: 'NOT', operand: $2};}
    | '(' e ')'
        {$$ = $2;}
    | IDENTIFIER
        {$$ = {identifier: yytext};}
    | TRUE
        {$$ = {constant: true};}
    | FALSE
        {$$ = {constant: false};}
    ;
