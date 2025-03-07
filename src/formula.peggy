// Formula Grammar

{
  function createBinaryOp(operator, left, right) {
    return {
      type: 'BinaryOperation',
      operator: operator,
      left: left,
      right: right
    };
  }
}

Formula
  = Expression

Expression
  = LogicalExpression

LogicalExpression
  = head:ComparisonExpression tail:(_ LogicalOperator _ ComparisonExpression)* {
      return tail.reduce((result, [, operator, , term]) => ({
        type: 'LogicalExpression',
        operator: operator,
        left: result,
        right: term,
        evaluate: function(context) {
          const leftValue = this.left.evaluate(context);
          const rightValue = this.right.evaluate(context);
          switch(operator.toLowerCase()) {
            case '&&':
            case 'and': return leftValue && rightValue;
            case '||':
            case 'or': return leftValue || rightValue;
            default: throw new Error(`Unknown logical operator: ${operator}`);
          }
        }
      }), head);
    }

LogicalOperator
  = "&&" / "AND" / "||" / "OR"

ComparisonExpression
  = head:AdditiveExpression tail:(_ ComparisonOperator _ AdditiveExpression)* {
      return tail.reduce((result, [, operator, , term]) => ({
        type: 'ComparisonExpression',
        operator: operator,
        left: result,
        right: term,
        evaluate: function(context) {
          const leftValue = this.left.evaluate(context);
          const rightValue = this.right.evaluate(context);
          switch(operator) {
            case '==':
            case '=': return leftValue == rightValue;
            case '!=': return leftValue != rightValue;
            case '>': return leftValue > rightValue;
            case '>=': return leftValue >= rightValue;
            case '<': return leftValue < rightValue;
            case '<=': return leftValue <= rightValue;
            default: throw new Error(`Unknown comparison operator: ${operator}`);
          }
        }
      }), head);
    }

ComparisonOperator
  = "==" / "=" / "!=" / ">=" / "<=" / ">" / "<"

Term
  = head:Factor tail:(_ ("*" / "/") _ Factor)* {
      return tail.reduce((result, [, operator, , factor]) => ({
        type: 'BinaryExpression',
        operator: operator,
        left: result,
        right: factor,
        evaluate: function(context) {
          const leftValue = this.left.evaluate(context);
          const rightValue = this.right.evaluate(context);
          return operator === '*' ? leftValue * rightValue : leftValue / rightValue;
        }
      }), head);
    }

Factor
  = Number
  / StringLiteral
  / BooleanLiteral
  / FunctionCall
  / FieldReference
  / "(" _ expr:Expression _ ")" {
      return {
        type: "ParenthesisExpression",
        expression: expr,
        evaluate: function(context) {
          return this.expression.evaluate(context);
        }
      };
    }

Number
  = digits:[0-9]+ {
      return {
        type: 'Number',
        value: parseInt(digits.join(""), 10),
        evaluate: function(context) {
          return this.value;
        }
      };
    }

FieldReference
  = first:[A-Za-z] rest:[A-Za-z0-9_]* {
      return {
        type: "FieldReference",
        name: first + rest.join(""),
        evaluate: function(context) {
          if (context && context.hasOwnProperty(this.name)) {
            return context[this.name];
          }
          throw new Error(`Variable "${this.name}" not found in context`);
        }
      };
    }

AdditiveExpression
  = head:MultiplicativeExpression tail:(_ ("+" / "-" / "&") _ MultiplicativeExpression)* {
      return tail.reduce((result, [, operator, , term]) => ({
        type: 'BinaryExpression',
        operator: operator,
        left: result,
        right: term,
        evaluate: function(context) {
          const leftValue = this.left.evaluate(context);
          const rightValue = this.right.evaluate(context);
          
          if ((operator === '+' || operator === '&') && (typeof leftValue === 'string' || typeof rightValue === 'string')) {
            return String(leftValue) + String(rightValue);
          }
          
          return operator === '+' ? leftValue + rightValue : leftValue - rightValue;
        }
      }), head);
    }

MultiplicativeExpression
  = head:Factor tail:(_ ("*" / "/") _ Factor)* {
      return tail.reduce((result, [, operator, , factor]) => ({
        type: 'BinaryExpression',
        operator: operator,
        left: result,
        right: factor,
        evaluate: function(context) {
          const leftValue = this.left.evaluate(context);
          const rightValue = this.right.evaluate(context);
          if (operator === '*') {
            return leftValue * rightValue;
          }
          if (rightValue === 0) {
            throw new Error('Division by zero');
          }
          return leftValue / rightValue;
        }
      }), head);
    }

PrimaryExpression
  = Literal
  / FunctionCall
  / FieldReference
  / "(" expr:Expression ")" { return expr; }

FunctionCall
  = name:("LOWER" / "ROUND" / "ABS" / "IF" / "CASE") _ "(" _ args:ArgumentList? _ ")" {
      return {
        type: "FunctionCall",
        name: name,
        arguments: args || [],
        evaluate: function(context) {
          const args = this.arguments;

          switch(this.name) {
            case "LOWER":
              if (args.length !== 1) throw new Error("LOWER function requires exactly one argument");
              const strArg = args[0].evaluate(context);
              if (typeof strArg !== 'string') throw new Error("LOWER function requires a string argument");
              return strArg.toLowerCase();

            case "ROUND":
              if (args.length !== 1 && args.length !== 2) throw new Error("ROUND function requires one or two arguments");
              const numArg = args[0].evaluate(context);
              if (typeof numArg !== 'number') throw new Error("ROUND function requires a number as first argument");
              const decimals = args.length === 2 ? args[1].evaluate(context) : 0;
              if (typeof decimals !== 'number') throw new Error("ROUND function requires a number as second argument");
              const factor = Math.pow(10, decimals);
              return Math.round(numArg * factor) / factor;

            case "ABS":
              if (args.length !== 1) throw new Error("ABS function requires exactly one argument");
              const absArg = args[0].evaluate(context);
              if (typeof absArg !== 'number') throw new Error("ABS function requires a number argument");
              return Math.abs(absArg);

            case "IF":
              if (args.length !== 3) throw new Error("IF function requires exactly three arguments");
              const condition = args[0].evaluate(context);
              return condition ? args[1].evaluate(context) : args[2].evaluate(context);

            case "CASE":
              if (args.length < 3) throw new Error("CASE function requires at least 3 arguments");
              if (args.length % 2 === 0) throw new Error("CASE function requires an odd number of arguments (condition1, result1, ..., defaultResult)");

              // Check each condition-result pair
              for (let i = 0; i < args.length - 1; i += 2) {
                const condition = args[i].evaluate(context);
                if (condition) {
                  return args[i + 1].evaluate(context);
                }
              }
              // Return default (last argument) if no conditions are true
              return args[args.length - 1].evaluate(context);

            default:
              throw new Error(`Unknown function: ${this.name}`);
          }
        }
      };
    }

FunctionName
  = "IF"
  / "CASE"
  / "LOWER"
  / "UPPER"
  / "ROUND"
  / "ABS"
  / "TODAY"
  / "DATEVALUE"
  / "DAYS"
  / [A-Z][A-Z_]*

ArgumentList
  = head:Expression tail:(_ "," _ Expression)* {
      return [head, ...tail.map(([,,,expr]) => expr)];
    }

Literal
  = StringLiteral
  / NumberLiteral
  / BooleanLiteral

StringLiteral
  = '"' chars:StringCharacter* '"' {
      return {
        type: "StringLiteral",
        value: chars.join(""),
        evaluate: function(context) {
          return this.value;
        }
      };
    }

StringCharacter
  = [^"\\\n\r]
  / "\\" sequence:EscapeSequence { return sequence; }

EscapeSequence
  = '"'  { return '"';  }
  / "\\" { return "\\"; }
  / "n"  { return "\n"; }
  / "r"  { return "\r"; }
  / "t"  { return "\t"; }

NumberLiteral
  = minus:"-"? digits:[0-9]+ decimal:("." [0-9]+)?
    { return {
        type: "NumberLiteral",
        value: parseFloat((minus || "") + digits.join("") + (decimal ? decimal[0] + decimal[1].join("") : ""))
      };
    }

BooleanLiteral
  = value:("true" / "false") {
      return {
        type: "BooleanLiteral",
        value: value === "true",
        evaluate: function(context) {
          return this.value;
        }
      };
    }

_ "whitespace"
  = [ \t\n\r]*