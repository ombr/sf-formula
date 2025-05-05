import { Tree, TreeCursor } from "@lezer/common";
import { Expression, Number, MulExpr, String, Boolean, Expr, MulOperator, ParenExpr, Term, AddOperator, Variable, Function, AddExpr, OrExpr, AndExpr, AndOperator, OrOperator, CompExpr, CompOperator } from "./parser.terms";
import { Context } from "./formula";

function evaluate(tree: Tree, input: string, context: Context = {}): unknown {
  function evaluateNode(cursor: TreeCursor): unknown {
    const node = cursor;
    if(!(cursor instanceof TreeCursor)) throw new Error('Node is not a tree');
    const nodeType: number = node.type.id;
    const text = function() {
      return input.slice(node.from, node.to);
    };
    
    const evaluateFirstChild = (cursor: TreeCursor): unknown => {
      if(!cursor.firstChild()) throw new Error('Expression has no children' + text());
      const value = evaluateNode(cursor);
      cursor.parent();
      return value;
    };
    const getVariable = (variables: string[]): unknown => {
      if(typeof context === 'function') {
        return context(variables);
      } else {
        let value:unknown = context;
        for(const fieldName of variables) {
          if( typeof value === 'object' && value !== null && !Object.hasOwn(value, fieldName)) throw new Error('Variable does not exists' + text());
          value = (value as Record<string, unknown>)[fieldName];
        }
        return value;
      }
    }
    const evaluateVariable = (cursor: TreeCursor): unknown => {
      if(!cursor.firstChild()) throw new Error('Variable has no children' + text());
      const fieldName = text();
      const variables = [fieldName];
      while(cursor.nextSibling()) {
        variables.push(text());
      }
      cursor.parent();
      if(variables.length === 1 && variables[0] === 'null') return null;
      if(variables.length === 1 && variables[0] === 'undefined') return undefined;
      return getVariable(variables);
    }
    const evaluateFunction = (cursor: TreeCursor): unknown => {
      console.log('evaluateFunction', text())
      if(!cursor.firstChild()) throw new Error('Expression has no children' + text());
      let value: unknown;
      let isBlank: boolean;
      const name = text();
      console.log('ICICI !!', name);
      switch(name) {
        case 'ISBLANK':
          if(!cursor.nextSibling()) {
            cursor.parent();
            return true;
          }
          value = evaluateNode(cursor);
          cursor.parent();
          return value === undefined || value === null || value === "" || (typeof value === 'string' && value.trim() === "");
        case 'NOT':
          if(!cursor.nextSibling()) throw new Error('NOT function has no arguments' + text());
          value = evaluateNode(cursor);
          cursor.parent();
          return value === true ? false : true;
        case 'LENGTH':
          if(!cursor.nextSibling()) throw new Error('LENGTH function has no arguments' + text());
          value = evaluateNode(cursor);
          cursor.parent();
          if(typeof value !== 'string') throw new Error('LENGTH function argument is not a string: ' + text());
          return value.length;
        case 'TEXT':
          if(!cursor.nextSibling()) throw new Error('TEXT function has no arguments');
          value = evaluateNode(cursor);
          cursor.parent();
          if(typeof value !== 'number') throw new Error('TEXT function argument is not a number: ' + text());
          return value.toString();
        case 'FLOOR':
          if(!cursor.nextSibling()) throw new Error('FLOOR function has no arguments');
          value = evaluateNode(cursor);
          cursor.parent();
          if(typeof value !== 'number') throw new Error('FLOOR function argument is not a number: ' + text());
          return Math.floor(value);
        case 'CEILING':
          if(!cursor.nextSibling()) throw new Error('CEILING function has no arguments');
          value = evaluateNode(cursor);
          cursor.parent();
          if(typeof value !== 'number') throw new Error('CEILING function argument is not a number: ' + text());
          return Math.ceil(value);
        case 'BLANKVALUE':
          if(!cursor.nextSibling()) {
            cursor.parent();
            throw new Error('BLANKVALUE function requires 2 arguments: ' + text());
          }
          value = evaluateNode(cursor);
          isBlank = value === undefined || value === null || value === "" || (typeof value === 'string' && value.trim() === "");
          if(!cursor.nextSibling()) {
            cursor.parent();
            cursor.parent();
            throw new Error('BLANKVALUE function requires 2 arguments: ' + text());
          }
          if(isBlank) value = evaluateNode(cursor);
          cursor.parent();
          return value;
        case 'IF':
          if(!cursor.nextSibling()) throw new Error('IF function has no arguments' + text());
          value = evaluateNode(cursor);
          if(value === true) {
            if(!cursor.nextSibling()) throw new Error('IF function is missing true argument' + text());
            value = evaluateNode(cursor);
            cursor.parent();
            return value;
          } else {
            if(!cursor.nextSibling()) throw new Error('IF function is missing true argument ' + text());
            if(!cursor.nextSibling()) throw new Error('IF function is missing false argument ' + text());
            value = evaluateNode(cursor);
            cursor.parent();
            return value;
          }
        default:
          console.log('ICIC ?', name)
          value = getVariable([name]);
          if(typeof value !== 'function') throw new Error(`Unknown function: ${name} ${text()}`);
          const args: Array<()=> unknown> = [];
          while(cursor.nextSibling()) {
            const newCursor = cursor.node.cursor();
            args.push(()=> {
              return evaluateNode(newCursor);
            })
          }
          value = value(...args);
          cursor.parent();
          return value;
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
        return evaluateFirstChild(cursor);
      case Expr:
      case MulExpr:
      case AddExpr:
      case OrExpr:
      case AndExpr:
      case CompExpr:
        eachChild((index)=> {
          if(index === 0) {
            value = evaluateNode(cursor);
            return;
          }
          if(index % 2 === 0) {
            switch(operator.id) {
              case CompOperator:
                switch(operator.text) {
                  case '>=':
                    if(typeof value !== 'number') throw new Error('Value is not a number' + text());
                    right = evaluateNode(cursor);
                    if(typeof right !== 'number') throw new Error('Value is not a number' + text());
                    value = value >= right;
                    break;
                  case '<=':
                    if(typeof value !== 'number') throw new Error('Value is not a number' + text());
                    right = evaluateNode(cursor);
                    if(typeof right !== 'number') throw new Error('Value is not a number' + text());
                    value = value <= right;
                    break;
                  case '>':
                    if(typeof value !== 'number') throw new Error('Value is not a number' + text());
                    right = evaluateNode(cursor);
                    if(typeof right !== 'number') throw new Error('Value is not a number' + text());
                    value = value > right;
                    break;
                  case '<':
                    if(typeof value !== 'number') throw new Error('Value is not a number' + text());
                    right = evaluateNode(cursor);
                    if(typeof right !== 'number') throw new Error('Value is not a number' + text());
                    value = value < right;
                    break;
                  case '==':
                  case '=':
                    value = value === evaluateNode(cursor);
                    break;
                  case '!=':
                    value = value !== evaluateNode(cursor);
                    break;
                  default:
                    throw new Error('Unknown operator');
                }
                break;
              case AndOperator:
                value = value && evaluateNode(cursor);
                break;
              case OrOperator:
                value = value || evaluateNode(cursor);
                break;
              case AddOperator:
                right = evaluateNode(cursor);
                switch(operator.text) {
                  case '&':
                  case '+':
                    if(typeof value === 'number' && typeof right === 'number') {
                      value = value + right;
                    } else if (typeof value === 'string' && typeof right === 'string') {
                      value = value + right;
                    } else {
                      throw new Error('Incompatible types' + text());
                    }
                    break;
                  case '-':
                    if(typeof value !== 'number') throw new Error('Value is not a number' + text());
                    if(typeof right !== 'number') throw new Error('Value is not a number' + text());
                    value -= right;
                    break;
                  default:
                    throw new Error('Unknown operator' + text());
                }
                break;
              case MulOperator:
                if(typeof value !== 'number') throw new Error('Value is not a number' + text());
                right = evaluateNode(cursor);
                if(typeof right !== 'number') throw new Error('Value is not a number' + text());
                switch(operator.text) {
                  case '*':
                    value *= right;
                    break;
                  case '/':
                    value = value / right;
                    break;
                  default:
                    throw new Error('Unknown operator' + text());
                }
                break;
              default:
                throw new Error('Unknown operator' + text());
            }
          } else {
            const Operators = [OrOperator, AndOperator, MulOperator, AddOperator, CompOperator];
            if(!(Operators.includes(cursor.type.id))) throw new Error(`Unknown operator ${cursor.type.name} ${text()}`);
            operator = {
              id: cursor.type.id,
              text: text(),
            }
          }
        });
        return value;
      case Number:
        return parseFloat(text());
      case String:
        value = text();
        if(typeof value !== 'string') throw new Error('Value is not a string' + text());
        return value.substring(1, value.length - 1);
      case Boolean:
        return text() === "true";
      case Variable:
        return evaluateVariable(cursor);
      case Function:
        return evaluateFunction(cursor);
      default:
        if(nodeType === 0) return undefined;
        throw new Error(`Unknown node type: ${nodeType} ${text()}`);
    }
  }
  return evaluateNode(tree.cursor());
}

export { evaluate };
