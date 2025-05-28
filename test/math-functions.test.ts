import { Context, formulaEval, Options } from '../src/formula';

// Helper functions
function testFormula(formula: string, context: Context, expected: unknown, description: string) {
  const title = `${description} ${formula} => ${JSON.stringify(expected)}`;
  it(title, () => {
    expect(formulaEval(formula, context)).toBe(expected);
  });
}

function testFormulaWithOptions(formula: string, context: Context, options: Options, expected: unknown, description: string) {
  const title = `${description} ${formula} => ${JSON.stringify(expected)}`;
  it(title, () => {
    expect(formulaEval(formula, context, options)).toBe(expected);
  });
}

function testFormulaError(formula: string, context: Context, expectedError: string, description: string) {
  it(description, () => {
    expect(() => formulaEval(formula, context))
      .toThrow(expectedError);
  });
}

describe('Math Functions', () => {
  describe('FLOOR', () => {
    testFormula('FLOOR(5.7)', {}, 5, 'FLOOR function with positive number');
    testFormula('FLOOR(5.2)', {}, 5, 'FLOOR function with positive number');
    testFormula('FLOOR(-5.7)', {}, -6, 'FLOOR function with negative number');
    testFormula('FLOOR(-5.2)', {}, -6, 'FLOOR function with negative number');
    testFormula('FLOOR(5)', {}, 5, 'FLOOR function with integer');
    testFormulaError('FLOOR("abc")', {}, 'Argument should be a number', 'FLOOR function with non-number');
    testFormulaError('FLOOR()', {}, 'Not enough arguments 0/1', 'FLOOR with no arguments');
    testFormulaError('FLOOR(1, 2)', {}, 'Too many arguments 2/1', 'FLOOR with too many arguments');
  });

  describe('CEILING', () => {
    testFormula('CEILING(5.7)', {}, 6, 'CEILING function with positive number');
    testFormula('CEILING(5.2)', {}, 6, 'CEILING function with positive number');
    testFormula('CEILING(-5.7)', {}, -5, 'CEILING function with negative number');
    testFormula('CEILING(-5.2)', {}, -5, 'CEILING function with negative number');
    testFormula('CEILING(5)', {}, 5, 'CEILING function with integer');
    testFormulaError('CEILING("abc")', {}, 'Argument should be a number', 'CEILING function with non-number');
    testFormulaError('CEILING()', {}, 'Not enough arguments 0/1', 'CEILING with no arguments');
    testFormulaError('CEILING(1, 2)', {}, 'Too many arguments 2/1', 'CEILING with too many arguments');
  });

  describe('ABS', () => {
    testFormula('ABS(-5)', {}, 5, 'ABS with negative number');
    testFormula('ABS(5)', {}, 5, 'ABS with positive number');
    testFormula('ABS(0)', {}, 0, 'ABS with zero');
    testFormulaError('ABS("abc")', {}, 'Argument should be a number', 'ABS with string argument');
    testFormulaError('ABS()', {}, 'Not enough arguments 0/1', 'ABS with no arguments');
    testFormulaError('ABS(1, 2)', {}, 'Too many arguments 2/1', 'ABS with too many arguments');
  });

  describe('ACOS', () => {
    testFormula('ACOS(1)', {}, Math.acos(1), 'ACOS with 1');
    testFormula('ACOS(0)', {}, Math.acos(0), 'ACOS with 0');
    testFormula('ACOS(-1)', {}, Math.acos(-1), 'ACOS with -1');
    testFormula('ACOS(0.5)', {}, Math.acos(0.5), 'ACOS with 0.5');
    testFormula('ACOS(2)', {}, NaN, 'ACOS with input > 1'); // Math.acos(2) is NaN
    testFormula('ACOS(-2)', {}, NaN, 'ACOS with input < -1'); // Math.acos(-2) is NaN
    testFormulaError('ACOS("abc")', {}, 'Argument should be a number', 'ACOS with string argument');
    testFormulaError('ACOS()', {}, 'Not enough arguments 0/1', 'ACOS with no arguments');
    testFormulaError('ACOS(1, 2)', {}, 'Too many arguments 2/1', 'ACOS with too many arguments');
  });

  describe('ASIN', () => {
    testFormula('ASIN(1)', {}, Math.asin(1), 'ASIN with 1');
    testFormula('ASIN(0)', {}, Math.asin(0), 'ASIN with 0');
    testFormula('ASIN(-1)', {}, Math.asin(-1), 'ASIN with -1');
    testFormula('ASIN(0.5)', {}, Math.asin(0.5), 'ASIN with 0.5');
    testFormula('ASIN(2)', {}, NaN, 'ASIN with input > 1'); // Math.asin(2) is NaN
    testFormula('ASIN(-2)', {}, NaN, 'ASIN with input < -1'); // Math.asin(-2) is NaN
    testFormulaError('ASIN("abc")', {}, 'Argument should be a number', 'ASIN with string argument');
    testFormulaError('ASIN()', {}, 'Not enough arguments 0/1', 'ASIN with no arguments');
    testFormulaError('ASIN(1, 2)', {}, 'Too many arguments 2/1', 'ASIN with too many arguments');
  });

  describe('ATAN', () => {
    testFormula('ATAN(0)', {}, Math.atan(0), 'ATAN with 0');
    testFormula('ATAN(1)', {}, Math.atan(1), 'ATAN with 1');
    testFormula('ATAN(-1)', {}, Math.atan(-1), 'ATAN with -1');
    testFormulaError('ATAN("abc")', {}, 'Argument should be a number', 'ATAN with string argument');
    testFormulaError('ATAN()', {}, 'Not enough arguments 0/1', 'ATAN with no arguments');
    testFormulaError('ATAN(1, 2)', {}, 'Too many arguments 2/1', 'ATAN with too many arguments');
  });

  describe('ATAN2', () => {
    testFormula('ATAN2(0, 0)', {}, Math.atan2(0, 0), 'ATAN2 with (0, 0)');
    testFormula('ATAN2(1, 1)', {}, Math.atan2(1, 1), 'ATAN2 with (1, 1)');
    testFormula('ATAN2(-1, 1)', {}, Math.atan2(-1, 1), 'ATAN2 with (-1, 1)');
    testFormula('ATAN2(1, -1)', {}, Math.atan2(1, -1), 'ATAN2 with (1, -1)');
    testFormula('ATAN2(10, 0)', {}, Math.atan2(10, 0), 'ATAN2 with (10, 0)');
    testFormula('ATAN2(0, 10)', {}, Math.atan2(0, 10), 'ATAN2 with (0, 10)');
    testFormulaError('ATAN2("a", 1)', {}, 'Arguments should be numbers', 'ATAN2 with string argument for y');
    testFormulaError('ATAN2(1, "b")', {}, 'Arguments should be numbers', 'ATAN2 with string argument for x');
    testFormulaError('ATAN2()', {}, 'Not enough arguments 0/2', 'ATAN2 with no arguments');
    testFormulaError('ATAN2(1)', {}, 'Not enough arguments 1/2', 'ATAN2 with one argument');
    testFormulaError('ATAN2(1, 2, 3)', {}, 'Too many arguments 3/2', 'ATAN2 with too many arguments');
  });

  describe('COS', () => {
    testFormula('COS(0)', {}, Math.cos(0), 'COS with 0');
    testFormula('COS(PI())', {}, Math.cos(Math.PI), 'COS with PI');
    testFormula('COS(PI()/2)', {}, Math.cos(Math.PI / 2), 'COS with PI/2');
    testFormulaError('COS("abc")', {}, 'Argument should be a number', 'COS with string argument');
    testFormulaError('COS()', {}, 'Not enough arguments 0/1', 'COS with no arguments');
    testFormulaError('COS(1, 2)', {}, 'Too many arguments 2/1', 'COS with too many arguments');
  });

  describe('EXP', () => {
    testFormula('EXP(1)', {}, Math.exp(1), 'EXP with 1');
    testFormula('EXP(0)', {}, Math.exp(0), 'EXP with 0');
    testFormula('EXP(-1)', {}, Math.exp(-1), 'EXP with -1');
    testFormulaError('EXP("abc")', {}, 'Argument should be a number', 'EXP with string argument');
    testFormulaError('EXP()', {}, 'Not enough arguments 0/1', 'EXP with no arguments');
    testFormulaError('EXP(1, 2)', {}, 'Too many arguments 2/1', 'EXP with too many arguments');
  });

  describe('LN', () => {
    testFormula('LN(EXP(1))', {}, 1, 'LN with EXP(1)');
    testFormula('LN(1)', {}, Math.log(1), 'LN with 1');
    testFormula('LN(10)', {}, Math.log(10), 'LN with 10');
    testFormula('LN(0)', {}, -Infinity, 'LN with 0'); // Math.log(0) is -Infinity
    testFormula('LN(-1)', {}, NaN, 'LN with -1'); // Math.log(-1) is NaN
    testFormulaError('LN("abc")', {}, 'Argument should be a number', 'LN with string argument');
    testFormulaError('LN()', {}, 'Not enough arguments 0/1', 'LN with no arguments');
    testFormulaError('LN(1, 2)', {}, 'Too many arguments 2/1', 'LN with too many arguments');
  });

  describe('LOG', () => { // Assumes LOG is LOG10
    testFormula('LOG(10)', {}, 1, 'LOG with 10');
    testFormula('LOG(100)', {}, 2, 'LOG with 100');
    testFormula('LOG(1)', {}, 0, 'LOG with 1');
    testFormula('LOG(0)', {}, -Infinity, 'LOG with 0'); // Math.log10(0) is -Infinity
    testFormula('LOG(-1)', {}, NaN, 'LOG with -1'); // Math.log10(-1) is NaN
    testFormulaError('LOG("abc")', {}, 'Argument should be a number', 'LOG with string argument');
    testFormulaError('LOG()', {}, 'Not enough arguments 0/1', 'LOG with no arguments');
    testFormulaError('LOG(1, 2)', {}, 'Too many arguments 2/1', 'LOG with too many arguments');
  });

  describe('MAX', () => {
    testFormula('MAX(1, 2, 3)', {}, 3, 'MAX with multiple positive numbers');
    testFormula('MAX(-1, -2, -3)', {}, -1, 'MAX with multiple negative numbers');
    testFormula('MAX(10, 0, -10)', {}, 10, 'MAX with mixed numbers');
    testFormula('MAX(5)', {}, 5, 'MAX with single number');
    testFormula('MAX(5, 10)', {}, 10, 'MAX with two numbers');
    testFormulaError('MAX("a", 1)', {}, 'All arguments should be numbers', 'MAX with string argument');
    testFormulaError('MAX(1, "b")', {}, 'All arguments should be numbers', 'MAX with string argument');
    testFormulaError('MAX()', {}, 'Not enough arguments 0/1', 'MAX with no arguments');
  });

  describe('MCEILING', () => {
    testFormula('MCEILING(5.7)', {}, 6, 'MCEILING function with positive number');
    testFormula('MCEILING(5.2)', {}, 6, 'MCEILING function with positive number');
    testFormula('MCEILING(-5.7)', {}, -5, 'MCEILING function with negative number');
    testFormulaError('MCEILING("abc")', {}, 'Argument should be a number', 'MCEILING function with non-number');
    testFormulaError('MCEILING()', {}, 'Not enough arguments 0/1', 'MCEILING with no arguments');
    testFormulaError('MCEILING(1, 2)', {}, 'Too many arguments 2/1', 'MCEILING with too many arguments');
  });

  describe('MFLOOR', () => {
    testFormula('MFLOOR(5.7)', {}, 5, 'MFLOOR function with positive number');
    testFormula('MFLOOR(5.2)', {}, 5, 'MFLOOR function with positive number');
    testFormula('MFLOOR(-5.7)', {}, -6, 'MFLOOR function with negative number');
    testFormulaError('MFLOOR("abc")', {}, 'Argument should be a number', 'MFLOOR function with non-number');
    testFormulaError('MFLOOR()', {}, 'Not enough arguments 0/1', 'MFLOOR with no arguments');
    testFormulaError('MFLOOR(1, 2)', {}, 'Too many arguments 2/1', 'MFLOOR with too many arguments');
  });

  describe('MIN', () => {
    testFormula('MIN(1, 2, 3)', {}, 1, 'MIN with multiple positive numbers');
    testFormula('MIN(-1, -2, -3)', {}, -3, 'MIN with multiple negative numbers');
    testFormula('MIN(10, 0, -10)', {}, -10, 'MIN with mixed numbers');
    testFormula('MIN(5)', {}, 5, 'MIN with single number');
    testFormula('MIN(5, 10)', {}, 5, 'MIN with two numbers');
    testFormulaError('MIN("a", 1)', {}, 'All arguments should be numbers', 'MIN with string argument');
    testFormulaError('MIN(1, "b")', {}, 'All arguments should be numbers', 'MIN with string argument');
    testFormulaError('MIN()', {}, 'Not enough arguments 0/1', 'MIN with no arguments');
  });

  describe('MOD', () => {
    testFormula('MOD(10, 3)', {}, 1, 'MOD with positive numbers');
    testFormula('MOD(-10, 3)', {}, -1, 'MOD with negative dividend');
    testFormula('MOD(10, -3)', {}, 1, 'MOD with negative divisor'); // Behavior of % operator
    testFormula('MOD(-10, -3)', {}, -1, 'MOD with negative numbers');
    testFormula('MOD(10, 0)', {}, NaN, 'MOD with divisor 0'); // 10 % 0 is NaN
    testFormulaError('MOD("a", 1)', {}, 'Arguments should be numbers', 'MOD with string argument for dividend');
    testFormulaError('MOD(1, "b")', {}, 'Arguments should be numbers', 'MOD with string argument for divisor');
    testFormulaError('MOD()', {}, 'Not enough arguments 0/2', 'MOD with no arguments');
    testFormulaError('MOD(1)', {}, 'Not enough arguments 1/2', 'MOD with one argument');
    testFormulaError('MOD(1, 2, 3)', {}, 'Too many arguments 3/2', 'MOD with too many arguments');
  });

  describe('PI', () => {
    testFormula('PI()', {}, Math.PI, 'PI function');
    testFormulaError('PI(1)', {}, 'Too many arguments 1/0', 'PI with argument');
  });

  describe('ROUND', () => {
    testFormula('ROUND(5.7)', {}, 6, 'ROUND with 5.7');
    testFormula('ROUND(5.2)', {}, 5, 'ROUND with 5.2');
    testFormula('ROUND(5.5)', {}, 6, 'ROUND with 5.5 (ties to away from zero)');
    testFormula('ROUND(-5.7)', {}, -6, 'ROUND with -5.7');
    testFormula('ROUND(-5.2)', {}, -5, 'ROUND with -5.2');
    testFormula('ROUND(-5.5)', {}, -5, 'ROUND with -5.5 (ties to -5 in JS)'); // Math.round(-5.5) is -5
    testFormulaError('ROUND("abc")', {}, 'Argument should be a number', 'ROUND with string argument');
    testFormulaError('ROUND()', {}, 'Not enough arguments 0/1', 'ROUND with no arguments');
    testFormulaError('ROUND(1, 2)', {}, 'Too many arguments 2/1', 'ROUND with too many arguments');
  });

  describe('SIN', () => {
    testFormula('SIN(0)', {}, Math.sin(0), 'SIN with 0');
    testFormula('SIN(PI()/2)', {}, Math.sin(Math.PI / 2), 'SIN with PI/2');
    testFormula('SIN(PI())', {}, Math.sin(Math.PI), 'SIN with PI');
    testFormulaError('SIN("abc")', {}, 'Argument should be a number', 'SIN with string argument');
    testFormulaError('SIN()', {}, 'Not enough arguments 0/1', 'SIN with no arguments');
    testFormulaError('SIN(1, 2)', {}, 'Too many arguments 2/1', 'SIN with too many arguments');
  });

  describe('SQRT', () => {
    testFormula('SQRT(4)', {}, 2, 'SQRT with perfect square');
    testFormula('SQRT(2)', {}, Math.sqrt(2), 'SQRT with non-perfect square');
    testFormula('SQRT(0)', {}, 0, 'SQRT with 0');
    testFormula('SQRT(-1)', {}, NaN, 'SQRT with -1'); // Math.sqrt(-1) is NaN
    testFormulaError('SQRT("abc")', {}, 'Argument should be a number', 'SQRT with string argument');
    testFormulaError('SQRT()', {}, 'Not enough arguments 0/1', 'SQRT with no arguments');
    testFormulaError('SQRT(1, 2)', {}, 'Too many arguments 2/1', 'SQRT with too many arguments');
  });

  describe('TAN', () => {
    testFormula('TAN(0)', {}, Math.tan(0), 'TAN with 0');
    testFormula('TAN(PI()/4)', {}, Math.tan(Math.PI / 4), 'TAN with PI/4');
    testFormulaError('TAN("abc")', {}, 'Argument should be a number', 'TAN with string argument');
    testFormulaError('TAN()', {}, 'Not enough arguments 0/1', 'TAN with no arguments');
    testFormulaError('TAN(1, 2)', {}, 'Too many arguments 2/1', 'TAN with too many arguments');
  });

  describe('TRUNC', () => {
    testFormula('TRUNC(5.7)', {}, 5, 'TRUNC with positive number');
    testFormula('TRUNC(-5.7)', {}, -5, 'TRUNC with negative number');
    testFormula('TRUNC(5)', {}, 5, 'TRUNC with integer');
    testFormula('TRUNC(5.21312312)', {}, 5, 'TRUNC with positive number');
    testFormulaError('TRUNC("abc")', {}, 'Argument should be a number', 'TRUNC with string argument');
    testFormulaError('TRUNC()', {}, 'Not enough arguments 0/1', 'TRUNC with no arguments');
    testFormulaError('TRUNC(1, 2)', {}, 'Too many arguments 2/1', 'TRUNC with too many arguments');
  });
});
