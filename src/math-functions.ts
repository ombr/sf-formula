import { validateArgs } from "./functions";

export const FLOOR = (...args: Array<() => unknown>) => {
  const value = validateArgs(args, {min: 1, max: 1})[0]();
  if(typeof value !== 'number') throw new Error('Argument should be a number');
  return Math.floor(value);
};

export const CEILING = (...args: Array<() => unknown>) => {
  const value = validateArgs(args, {min: 1, max: 1})[0]();
  if(typeof value !== 'number') throw new Error('Argument should be a number');
  return Math.ceil(value);
};

export const ABS = (...args: Array<() => unknown>) => {
  const value = validateArgs(args, {min: 1, max: 1})[0]();
  if (typeof value !== 'number') throw new Error('Argument should be a number');
  return Math.abs(value);
};

export const ACOS = (...args: Array<() => unknown>) => {
  const value = validateArgs(args, {min: 1, max: 1})[0]();
  if (typeof value !== 'number') throw new Error('Argument should be a number');
  return Math.acos(value);
};

export const ASIN = (...args: Array<() => unknown>) => {
  const value = validateArgs(args, {min: 1, max: 1})[0]();
  if (typeof value !== 'number') throw new Error('Argument should be a number');
  return Math.asin(value);
};

export const ATAN = (...args: Array<() => unknown>) => {
  const value = validateArgs(args, {min: 1, max: 1})[0]();
  if (typeof value !== 'number') throw new Error('Argument should be a number');
  return Math.atan(value);
};

export const ATAN2 = (...args: Array<() => unknown>) => {
  const [yArg, xArg] = validateArgs(args, {min: 2, max: 2});
  const y = yArg();
  const x = xArg();
  if (typeof y !== 'number' || typeof x !== 'number') throw new Error('Arguments should be numbers');
  return Math.atan2(y, x);
};

export const COS = (...args: Array<() => unknown>) => {
  const value = validateArgs(args, {min: 1, max: 1})[0]();
  if (typeof value !== 'number') throw new Error('Argument should be a number');
  return Math.cos(value);
};

export const EXP = (...args: Array<() => unknown>) => {
  const value = validateArgs(args, {min: 1, max: 1})[0]();
  if (typeof value !== 'number') throw new Error('Argument should be a number');
  return Math.exp(value);
};

export const LN = (...args: Array<() => unknown>) => {
  const value = validateArgs(args, {min: 1, max: 1})[0]();
  if (typeof value !== 'number') throw new Error('Argument should be a number');
  return Math.log(value);
};

export const LOG = (...args: Array<() => unknown>) => {
  const value = validateArgs(args, {min: 1, max: 1})[0]();
  if (typeof value !== 'number') throw new Error('Argument should be a number');
  return Math.log10(value);
};

export const MAX = (...args: Array<() => unknown>) => {
  validateArgs(args, {min: 1});
  const values = args.map(arg => {
    const val = arg();
    if (typeof val !== 'number') throw new Error('All arguments should be numbers');
    return val;
  });
  return Math.max(...values);
};

export const MCEILING = (...args: Array<() => unknown>) => {
  const value = validateArgs(args, {min: 1, max: 1})[0]();
  if(typeof value !== 'number') throw new Error('Argument should be a number');
  return Math.ceil(value);
};

export const MFLOOR = (...args: Array<() => unknown>) => {
  const value = validateArgs(args, {min: 1, max: 1})[0]();
  if(typeof value !== 'number') throw new Error('Argument should be a number');
  return Math.floor(value);
};

export const MIN = (...args: Array<() => unknown>) => {
  validateArgs(args, {min: 1});
  const values = args.map(arg => {
    const val = arg();
    if (typeof val !== 'number') throw new Error('All arguments should be numbers');
    return val;
  });
  return Math.min(...values);
};

export const MOD = (...args: Array<() => unknown>) => {
  const [dividendArg, divisorArg] = validateArgs(args, {min: 2, max: 2});
  const dividend = dividendArg();
  const divisor = divisorArg();
  if (typeof dividend !== 'number' || typeof divisor !== 'number') throw new Error('Arguments should be numbers');
  return dividend % divisor;
};

export const PI = (...args: Array<() => unknown>) => {
  validateArgs(args, {max: 0});
  return Math.PI;
};

export const ROUND = (...args: Array<() => unknown>) => {
  const value = validateArgs(args, {min: 1, max: 1})[0]();
  if (typeof value !== 'number') throw new Error('Argument should be a number');
  return Math.round(value);
};

export const SIN = (...args: Array<() => unknown>) => {
  const value = validateArgs(args, {min: 1, max: 1})[0]();
  if (typeof value !== 'number') throw new Error('Argument should be a number');
  return Math.sin(value);
};

export const SQRT = (...args: Array<() => unknown>) => {
  const value = validateArgs(args, {min: 1, max: 1})[0]();
  if (typeof value !== 'number') throw new Error('Argument should be a number');
  return Math.sqrt(value);
};

export const TAN = (...args: Array<() => unknown>) => {
  const value = validateArgs(args, {min: 1, max: 1})[0]();
  if (typeof value !== 'number') throw new Error('Argument should be a number');
  return Math.tan(value);
};

export const TRUNC = (...args: Array<() => unknown>) => {
  const value = validateArgs(args, {min: 1, max: 1})[0]();
  if (typeof value !== 'number') throw new Error('Argument should be a number');
  return Math.trunc(value);
};
