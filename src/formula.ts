export type Context = Record<string, unknown>;

export function formula_eval(formula: string, context: Context): unknown {
  console.log(formula, context);
  return undefined;
}
