/* lexical grammar */
%lex
%%
\s+                       {/* skip whitespace */}
"1"                       {return 'TRUE';}
"0"                       {return 'FALSE';}
[A-Za-z][_A-Za-z0-9]*\b   {return 'IDENTIFIER';}
"\\wedge"                 {return 'AND';}
"\\vee"                   {return 'OR';}
"\\oplus"                 {return 'XOR';}
"+"                       {return 'XOR';}
"\\neg"                   {return 'NOT';}
"\\overline"              {return 'NOT';}

"("                       {return '(1';}
")"                       {return ')1';}

"\\bigl("                 {return '(2';}
"\\bigr)"                 {return ')2';}

"\\Bigl("                 {return '(3';}
"\\Bigr)"                 {return ')3';}

"\\biggl("                 {return '(4';}
"\\biggr)"                 {return ')4';}

"\\Biggl("                 {return '(5';}
"\\Biggr)"                 {return ')5';}

"["                       {return '[1';}
"]"                       {return ']1';}

"\\bigl["                 {return '[2';}
"\\bigr]"                 {return ']2';}

"\\Bigl["                 {return '[3';}
"\\Bigr]"                 {return ']3';}

"\\biggl["                 {return '[3';}
"\\biggr]"                 {return ']3';}

"\\Biggl["                 {return '[5';}
"\\Biggr]"                 {return ']5';}

","                       {return ',';}
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
    : expressionList EOF
        {return $1;}
    | EOF
        {return [];}
    ;

expressionList
    : e
        {$$ = [$1];}
    | expressionList ',' e
        {$$ = $1; $1.push($3);}
    ;

e   : e ' ' e
        {$$ = {node: 'binary', operator: 'AND', lhs: $1, rhs: $3};}
    | e 'AND' e
        {$$ = {node: 'binary', operator: 'AND', lhs: $1, rhs: $3};}
    | e 'OR' e
        {$$ = {node: 'binary', operator: 'OR', lhs: $1, rhs: $3};}
    | e 'XOR' e
        {$$ = {node: 'binary', operator: 'XOR', lhs: $1, rhs: $3};}
    | 'NOT' e
        {$$ = {node: 'unary', operator: 'NOT', operand: $2};}
    | '(1' e ')1'
        {$$ = {node: 'group', style: 1, content: $2};}
    | '(2' e ')2'
        {$$ = {node: 'group', style: 2, content: $2};}
    | '(3' e ')3'
        {$$ = {node: 'group', style: 3, content: $2};}
    | '(4' e ')4'
        {$$ = {node: 'group', style: 4, content: $2};}
    | '(5' e ')5'
        {$$ = {node: 'group', style: 5, content: $2};}
    | '[1' e ']1'
        {$$ = {node: 'group', style: -1, content: $2};}
    | '[2' e ']2'
        {$$ = {node: 'group', style: -2, content: $2};}
    | '[3' e ']3'
        {$$ = {node: 'group', style: -3, content: $2};}
    | '[4' e ']4'
        {$$ = {node: 'group', style: -4, content: $2};}
    | '[5' e ']5'
        {$$ = {node: 'group', style: -5, content: $2};}
    | IDENTIFIER
        {$$ = {node: 'identifier', name: yytext};}
    | TRUE
        {$$ = {node: 'constant', value: true};}
    | FALSE
        {$$ = {node: 'constant', value: false};}
    ;
