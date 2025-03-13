import { Tree, TreeCursor } from "@lezer/common";
import { Expression, Number, String, Boolean, AddExpr, MulExpr, ParenExpr, Term, AddOperator, MulOperator, Variable } from "./parser.terms";

function evaluate(tree: Tree, input: string, context: Record<string, any> = {}): any {
  const cursor = tree.cursor();
  function evaluateNode(): any {
    const node = cursor;
    if(!(cursor instanceof TreeCursor)) throw new Error('Node is not a tree');
    // Get the node type id
    const nodeType: number = node.type.id;
    const text = function() {
      return input.slice(node.from, node.to);
    };
    console.log('EVALUATE',text(), nodeType, context);
    
    const evaluateFirstChild = (): any => {
      if(!cursor.firstChild()) throw new Error('Expression has no children');
      const value = evaluateNode();
      cursor.parent();
      return value;
    };
    const eachChild = (callback: (index: number) => void): void => {
      console.log(" ======== eachChild");
      let index = 0;
      if(!cursor.firstChild()) return;
      // console.log("eachChild", index, cursor.name);
      // callback(index);
      do {
        console.log("eachChild", index, cursor.name);
        callback(index);
        index+=1;
      } while (cursor.nextSibling())
      cursor.parent();
    };

    switch (nodeType) {
      case Expression:
      case Term:
      case ParenExpr:
        return evaluateFirstChild();
      case AddExpr:
      case MulExpr:
        let value: unknown;
        let operator: number;
        eachChild((index)=> {
          if(index === 0) {
            value = evaluateNode();
            return;
          }
          if(index % 2 === 0) {
            switch(operator) {
              case AddOperator:
                value += evaluateNode();
                break;
              case MulOperator:
                if(typeof value !== 'number') throw new Error('Value is not a number');
                value *= evaluateNode();
                break;
              default:
                throw new Error('Unknown operator');
            }
          } else {
            operator = cursor.type.id;
          }
        });
        return value;
        /*console.log('OPERATION ?');
        let operator: Tree;
        getChildren().forEach((child, index) => {
          if(!(child instanceof Tree)) throw new Error('Child is not a tree');
          if( index === 0 ) {
            console.log('FIRST', child);
            value = evaluate(child);
            return;
          } 
          if(index % 2 === 0) {
            operator = node;
            return;
          }
          const right = evaluate(child);
          if(!operator) throw new Error('Operator is not set');
          switch(operator.type.id) {
            case AddOperator:
              value += right;
              break;
            case MulOperator:
              value *= right;
              break;
            default:
              throw new Error('Unknown operator');
          }
        });
        console.log('Operations ?', node.children, value);
        return value; */
      case Number:
        console.log('NUMNER ?', text())
        return parseInt(text(), 10);
      case String:
        const str: string = text();
        return str.substring(1, str.length - 1);
      case Boolean:
        return text() === "true";
      case Variable:
        const name = text();
        if(!Object.hasOwn(context, name)) throw new Error('Variable does not exists');
        return context[name];
      default:
        throw new Error(`Unknown node type: ${nodeType}`);
    }
  }
  return evaluateNode();
}

export { evaluate };
