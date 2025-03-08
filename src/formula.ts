import { parse } from "./parser";
export { parse };

export type Context = Record<string, unknown>;
export class FormulaError extends Error {};

export function formulaEval(formula: string, context: Context): unknown {
  const res = parse(formula, context)
  if (typeof formula !== 'string') throw new FormulaError('Formula should be a string');
  if (formula === '') throw new FormulaError('Formula text cannot be null or empty');

  if (typeof res === 'object' && Object.hasOwn(res, 'type')) {
    return res.evaluate(context); 
  }
  return undefined;
}
