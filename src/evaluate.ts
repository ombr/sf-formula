import { Tree, TreeCursor } from "@lezer/common";
import { Expression, Number, String, Boolean, Expr, MulExpr, ParenExpr, Term, AddOperator, MulOperator, Variable, Function, AddExpr, OrExpr, AndExpr, AndOperator, OrOperator, CompExpr, CompOperator } from "./parser.terms";

function evaluate(tree: Tree, input: string, context: Record<string, unknown> = {}): unknown {
  const cursor = tree.cursor();
  function evaluateNode(): unknown {
    const node = cursor;
    if(!(cursor instanceof TreeCursor)) throw new Error('Node is not a tree');
    const nodeType: number = node.type.id;
    const text = function() {
      return input.slice(node.from, node.to);
    };
    
    const evaluateFirstChild = (): unknown => {
      if(!cursor.firstChild()) throw new Error('Expression has no children');
      const value = evaluateNode();
      cursor.parent();
      return value;
    };
    const evaluateFunction = (): unknown => {
      if(!cursor.firstChild()) throw new Error('Expression has no children');
      let value: unknown;
      const name = text();
      switch(name) {
        case 'ISBLANK':
          if(!cursor.nextSibling()) {
            cursor.parent();
            return true;
          }
          value = evaluateNode();
          cursor.parent();
          return value === undefined || value === null || value === "" || (typeof value === 'string' && value.trim() === "");
        case 'NOT':
          if(!cursor.nextSibling()) {
            cursor.parent();
            return true;
          }
          value = evaluateNode();
          cursor.parent();
          return value === true ? false : true;
        case 'IF':
          if(!cursor.nextSibling()) throw new Error('IF function has no arguments');
          value = evaluateNode();
          if(value === true) {
            if(!cursor.nextSibling()) throw new Error('IF function is missing true argument');
            value = evaluateNode();
          } else {
            if(!cursor.nextSibling()) throw new Error('IF function is missing true argument');
            if(!cursor.nextSibling()) throw new Error('IF function is missing false argument');
            value = evaluateNode();
          }
          cursor.parent();
          return value;
        default:
          throw new Error(`Unknown function: ${name}`);
      }
    }
    const eachChild = (callback: (index: number) => void): void => {
      let index = 0;
      if(!cursor.firstChild()) return;
      do {
        callback(index);
        index+=1;
      } while (cursor.nextSibling())
      cursor.parent();
    };
    let value: unknown, right: unknown;
    let operator: {
      id: number,
      text: string,
    };

    switch (nodeType) {
      case Expression:
      case Term:
      case ParenExpr:
        return evaluateFirstChild();
      case Expr:
      case MulExpr:
      case AddExpr:
      case OrExpr:
      case AndExpr:
      case CompExpr:
        eachChild((index)=> {
          if(index === 0) {
            value = evaluateNode();
            return;
          }
          if(index % 2 === 0) {
            switch(operator.id) {
              case CompOperator:

                switch(operator.text) {
                  case '>=':
                    if(typeof value !== 'number') throw new Error('Value is not a number');
                    right = evaluateNode();
                    if(typeof right !== 'number') throw new Error('Value is not a number');
                    value = value >= right;
                    break;
                  case '<=':
                    if(typeof value !== 'number') throw new Error('Value is not a number');
                    right = evaluateNode();
                    if(typeof right !== 'number') throw new Error('Value is not a number');
                    value = value <= right;
                    break;
                  case '>':
                    if(typeof value !== 'number') throw new Error('Value is not a number');
                    right = evaluateNode();
                    if(typeof right !== 'number') throw new Error('Value is not a number');
                    value = value > right;
                    break;
                  case '<':
                    if(typeof value !== 'number') throw new Error('Value is not a number');
                    right = evaluateNode();
                    if(typeof right !== 'number') throw new Error('Value is not a number');
                    value = value < right;
                    break;
                  case '==':
                  case '=':
                    value = value === evaluateNode();
                    break;
                  case '!=':
                    value = value !== evaluateNode();
                    break;
                  default:
                    throw new Error('Unknown operator');
                }
                break;
              case AndOperator:
                value = value && evaluateNode();
                break;
              case OrOperator:
                value = value || evaluateNode();
                break;
              case AddOperator:
                right = evaluateNode();
                switch(operator.text) {
                  case '&':
                  case '+':
                    if(typeof value === 'number' && typeof right === 'number') {
                      value = value + right;
                    } else if (typeof value === 'string' && typeof right === 'string') {
                      value = value + right;
                    } else {
                      throw new Error('Incompatible types');
                    }
                    break;
                  case '-':
                    if(typeof value !== 'number') throw new Error('Value is not a number');
                    if(typeof right !== 'number') throw new Error('Value is not a number');
                    value -= right;
                    break;
                  default:
                    throw new Error('Unknown operator');
                }
                break;
              case MulOperator:
                if(typeof value !== 'number') throw new Error('Value is not a number');
                right = evaluateNode();
                if(typeof right !== 'number') throw new Error('Value is not a number');
                switch(operator.text) {
                  case '*':
                    value *= right;
                    break;
                  case '/':
                    value = value / right;
                    break;
                  default:
                    throw new Error('Unknown operator');
                }
                break;
              default:
                throw new Error('Unknown operator');
            }
          } else {
            operator = {
              id: cursor.type.id,
              text: text(),
            }
          }
        });
        return value;
      case Number:
        return parseInt(text(), 10);
      case String:
        value = text();
        if(typeof value !== 'string') throw new Error('Value is not a string');
        return value.substring(1, value.length - 1);
      case Boolean:
        return text() === "true";
      case Variable:
        value = text();
        if(typeof value !== 'string') throw new Error('Value is not a string');
        if(!Object.hasOwn(context, value)) throw new Error('Variable does not exists');
        return context[value];
      case Function:
        return evaluateFunction();
      default:
        throw new Error(`Unknown node type: ${nodeType}`);
    }
  }
  return evaluateNode();
}

export { evaluate };
