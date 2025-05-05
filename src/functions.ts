export function validateArgs(args: Array<()=> unknown>, validations: {min?: number, max?: number}) {
  const { min, max } = validations;
  if(min && args.length < min) throw new Error(`Not enough arguments ${args.length}/${min}`);
  if(max && args.length > max) throw new Error(`Too many arguments ${args.length}/${max}`);
  return args;
}

const isBlank = (value: unknown) => {
  return value === undefined || value === null || value === "" || (typeof value === 'string' && value.trim() === "");
}
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
  'BLANKVALUE': (...args: Array<() => unknown>) => {
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
  }
}