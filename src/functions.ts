export function validateArgs(args: Array<()=> unknown>, validations: {min?: number, max?: number}) {
  const { min, max } = validations;
  if(min && args.length < min) throw new Error(`Not enough arguments ${args.length}/${min}`);
  if(max && args.length > max) throw new Error(`Too many arguments ${args.length}/${max}`);
  return args;
}

const isBlank = (value: unknown) => {
  return value === undefined || value === null || value === "" || (typeof value === 'string' && value.trim() === "");
}
const blankvalue = (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 2});
    let i = 0;
    do {
      const arg = args[i];
      if(!arg) return undefined;
      const value = arg();
      if(!isBlank(value)) return value;
      i++;
      // eslint-disable-next-line no-constant-condition
    } while(true)
  };
export const defaultFunctions: Record<string, (...args: Array<()=> unknown>) => unknown> = {
  'ISBLANK': (...args: Array<() => unknown>) => {
    const value = validateArgs(args, {min: 1, max: 1})[0]();
    return isBlank(value);
  },
  'NOT': (...args: Array<() => unknown>) => {
    const value = validateArgs(args, {min: 1, max: 1})[0]();
    if(typeof value !== 'boolean') throw new Error('Argument should be a boolean')
    return !value;
  },
  'BLANKVALUE': blankvalue,
  'NULLVALUE': (...args: Array<() => unknown>) => {
    const [exprArg, substituteExprArg] = validateArgs(args, {min: 2, max: 2});
    const expr = exprArg();
    if (expr === null || expr === undefined) {
      return substituteExprArg();
    }
    return expr;
  },
  'TEXT': (...args: Array<() => unknown>) => {
    const value = validateArgs(args, {min: 1, max: 1})[0]();
    if(typeof value !== 'number') throw new Error('Argument should be a number')
    return value.toString();
  },
  'FLOOR': (...args: Array<() => unknown>) => {
    const value = validateArgs(args, {min: 1, max: 1})[0]();
    if(typeof value !== 'number') throw new Error('Argument should be a number')
    return Math.floor(value);
  },
  'CEILING': (...args: Array<() => unknown>) => {
    const value = validateArgs(args, {min: 1, max: 1})[0]();
    if(typeof value !== 'number') throw new Error('Argument should be a number')
    return Math.ceil(value);
  },
  'LEN': (...args: Array<() => unknown>) => {
    const value = validateArgs(args, {min: 1, max: 1})[0]();
    if(typeof value !== 'string') throw new Error('Argument should be a string')
    return value.length;
  },
  'IF': (...args: Array<() => unknown>) => {
    const [ifArg, thenArg, elseArg] = validateArgs(args, {min: 2, max: 3});
    const ifValue = ifArg();
    if(typeof ifValue !== 'boolean') throw new Error('First argument is not a boolean')
    if (ifValue) {
      return thenArg();
    }
    if(elseArg) {
      return elseArg();
    }
    return undefined;
  },
  'PI': (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 0, max: 0});
    return Math.PI;
  },
  'ISNUMBER': (...args: Array<() => unknown>) => {
    const [valueArg] = validateArgs(args, {min: 1, max: 1});
    const value = valueArg();

    if (typeof value === 'number') {
      return isFinite(value);
    }
    if (typeof value === 'string') {
      if (value.trim() === '') { // Salesforce ISNUMBER considers blank string not a number
        return false;
      }
      // Number(value) correctly handles strings with surrounding whitespace like " 123 "
      // and returns NaN for non-numeric strings like "abc" or "1,234" or "12.3.4"
      const num = Number(value);
      return !isNaN(num) && isFinite(num);
    }
    // Booleans, objects, null, undefined are not numbers for ISNUMBER
    return false;
  },
  'ISNULL': (...args: Array<() => unknown>) => {
    const [exprArg] = validateArgs(args, {min: 1, max: 1});
    const expr = exprArg();
    return expr === null || expr === undefined;
  },
  'CASE': (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 3});

    const value = args[0]();
    const numRemainingArgs = args.length - 1;

    // Iterate through value/result pairs
    // Each pair consists of 2 arguments.
    // If numRemainingArgs is odd, the last one is the else_result.
    const numPairs = Math.floor(numRemainingArgs / 2);

    for (let i = 0; i < numPairs; i++) {
      const valueN = args[1 + i * 2]();
      if (value === valueN) {
        return args[1 + i * 2 + 1]();
      }
    }

    // Check for else_result: if there's an odd number of arguments after the expression
    if (numRemainingArgs % 2 !== 0) {
      return args[args.length - 1]();
    }

    return null;
  },
}