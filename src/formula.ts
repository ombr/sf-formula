import { evaluate } from "./evaluate";
import { parser } from "./parser";
export { parser };

export type Context = Record<string, unknown> | ((variables: string[]) => unknown);
export class FormulaError extends Error {};

export function formulaEval(formula: string, context: Context): unknown {
  if (typeof formula !== 'string') throw new FormulaError('Formula should be a string');
  const res = parser.parse(formula);
  return evaluate(res, formula, context);
}
