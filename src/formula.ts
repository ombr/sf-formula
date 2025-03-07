import { parse } from "./parser";
export { parse };

export type Context = Record<string, unknown>;

export function formula_eval(formula: string, context: Context): unknown {
  const res = parse(formula, context)
  if (typeof res === 'object' && Object.hasOwn(res, 'type')) {
    return res.evaluate(context); 
  }
  return undefined;
}
