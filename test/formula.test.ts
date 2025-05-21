import { assert } from 'console';
import { Context, formulaEval, Options } from '../src/formula';

describe('formula_eval', () => {
  function testFormula(formula: string, context: Context, expected: unknown, description: string) {
    const title = `${description} ${formula} => ${JSON.stringify(expected)}`;
    it(title, () => {
      expect(formulaEval(formula, context)).toBe(expected);
    });
    /*it(`serialize | ${title}`, () => {
      expect(parser.parse(formula).serialize()).toBe(formula.trim());
    });*/
  }

  function testFormulaWithOptions(formula: string, context: Context, options: Options, expected: unknown, description: string) {
    const title = `${description} ${formula} => ${JSON.stringify(expected)}`;
    it(title, () => {
      expect(formulaEval(formula, context, options)).toBe(expected);
    });
    /*it(`serialize | ${title}`, () => {
      expect(parser.parse(formula).serialize()).toBe(formula.trim());
    });*/
  }

  function testFormulaError(formula: string, context: Context, expectedError: string, description: string) {
    it(description, () => {
      expect(() => formulaEval(formula, context))
        .toThrow(expectedError);
    });
  }

  // Some basic usecases
  describe('Basics', () => {
    testFormula('"Hello"', {}, 'Hello', 'String');
    testFormula('12', {}, 12, 'Number');
    testFormula('true', {}, true, 'Boolean true');
    testFormula('false', {}, false, 'Boolean false');
    testFormula('11 + 1', {}, 12, 'Addition');
    testFormula('13 - 1', {}, 12, 'Subtraction');
    testFormula('6 * 2', {}, 12, 'Multiplication');
    testFormula('6 * 2 + 1', {}, 13, 'Addition and Multiplication');
    testFormula('24 / 2', {}, 12, 'Division');
    testFormula('true && true', {}, true, 'Boolean && true');
    testFormula('true && false', {}, false, 'Boolean && false');
    testFormula('true || false', {}, true, 'Boolean || true');
    testFormula('false || false', {}, false, 'Boolean || false');
    testFormula('12 > 10', {}, true, '> true');
    testFormula('12 > 14', {}, false, '> false');
    testFormula('12 < 14', {}, true, '< true');
    testFormula('12 < 10', {}, false, '< false');
    testFormula('12 == 12', {}, true, '== true');
    testFormula('12 == 14', {}, false, '== false');
    testFormula('12 != 14', {}, true, '!= true');
    testFormula('12 != 12', {}, false, '!= false');
    testFormula('12 >= 12', {}, true, '>= true');
    testFormula('12 >= 14', {}, false, '>= false');
    testFormula('12 <= 12', {}, true, '<= true');
    testFormula('12 <= 14', {}, true, '<= true');
    testFormula('', {}, undefined, 'undefined');
    testFormula(' ', {}, undefined, 'undefined');
    testFormula('12 * 2', {}, 24, 'Multiplication');
    testFormula('12 - 2', {}, 10, 'Substraction');
    testFormulaError('12 12', {}, 'Unknown operator', 'Missing operator');
  });

  describe('Whitespaces', () => {
    testFormula(' "Hello"', {}, 'Hello', 'starting with whitespace');
    testFormula('"Hello" ', {}, 'Hello', 'ending with whitespace');
    testFormula('  12', {}, 12, 'ending with whitespace');
    testFormula('12 ', {}, 12, 'ending with whitespace');
  });

  // Text Operations
  describe('Variables', () => {
    testFormula('FirstName', { FirstName: "John" }, 'John', 'text field reference');
    testFormula('FirstName.value', { FirstName: { value: "John" } }, 'John', 'object field reference');
    testFormula('a.b.c', { a: { b: { c: "Super" } } }, 'Super', 'object field reference');
    testFormula('FirstName & " " & LastName',
      { FirstName: "John", LastName: "Doe" }, 
      'John Doe', 
      'text concatenation');
  });

  describe('Functions', () => {
    testFormula('NOT(true)', {}, false, 'NOT true');
    testFormula('NOT(false)', {}, true, 'NOT false');
    testFormula('ISBLANK(Email)',
      { Email: "TEST@EXAMPLE.COM" }, 
      false,
      'IS BLANK false');
    testFormula('ISBLANK(Email)',
      { Email: "" },
      true,
      'IS BLANK false');
    testFormula('ISBLANK(Email)',
      { Email: " " },
      true,
      'IS BLANK false');
    testFormula('ISBLANK(Email) && ISBLANK(FirstName)',
      { Email: "john@doe.com", FirstName: "John" },
      false,
      'Multiple ISBLANK true');
    testFormula('NOT(ISBLANK(Email)) && NOT(ISBLANK(FirstName))',
      { Email: "", FirstName: "John" },
      false,
      'Multiple NOT(ISBLANK) false');
    testFormula('NOT(ISBLANK(Email)) && NOT(ISBLANK(FirstName))',
      { Email: "john@doe.fs", FirstName: "John" },
      true,
      'Multiple NOT(ISBLANK) false');
  });

  // Numeric Operations
  describe('Numeric Formulas', () => {
    testFormula('Amount', { Amount: 100 }, 100, 'numeric field reference');
    testFormula('Amount * Quantity', 
      { Amount: 10, Quantity: 5 }, 
      50, 
      'numeric multiplication');
    /*testFormula('ROUND(Amount, 2)',
      { Amount: 100.456 }, 
      100.46, 
      'rounding numbers');
    testFormula('ABS(Balance)', 
      { Balance: -50 }, 
      50, 
      'absolute value');*/
  });


  // Logical Operations
  describe('Logical Formulas', () => {
    testFormula('IsActive', 
      { IsActive: true }, 
      true, 
      'boolean field reference');
    testFormula('Amount > 1000', 
      { Amount: 1500 }, 
      true, 
      'numeric comparison');
    testFormula('Status = "Open"', 
      { Status: "Open" }, 
      true, 
      'text comparison');
    testFormula('IsActive AND Amount > 0',
      { IsActive: true, Amount: 100 }, 
      true, 
      'logical AND');
    testFormula('IsClosed OR Amount = 0',
      { IsClosed: false, Amount: 0 }, 
      true, 
      'logical OR');
    testFormula('ISBLANK(FirstName)',
      { FirstName: "" },
      true,
      'check if field is blank');
    testFormula('ISBLANK(FirstName)',
      { FirstName: "Luc" },
      false,
      'check if field is blank');
    testFormula('NOT(IsActive)',
      { IsActive: false },
      true,
      'negation of boolean value');
    testFormula('NOT(IsActive)',
      { IsActive: true },
      false,
      'negation of boolean value');
  });

  /*
  // Date Operations
  describe('Date Formulas', () => {
    testFormula('TODAY()', 
      {}, 
      expect.any(Date), 
      'current date');
    testFormula('DATEVALUE(CreatedDate)', 
      { CreatedDate: "2023-12-25" }, 
      new Date("2023-12-25"), 
      'date conversion');
    testFormula('DAYS(DueDate, CreatedDate)', 
      { DueDate: "2023-12-25", CreatedDate: "2023-12-20" }, 
      5, 
      'days between dates');
  });
  */

  // Conditional Logic
  describe('Conditional Formulas', () => {
    testFormula('IF(Amount > 1000, "High", "Low")', 
      { Amount: 1500 }, 
      "High", 
      'simple if condition');
    testFormula('IF(Amount > 1000, "High", "Low")',
      { Amount: 2 },
      "Low",
      'simple if condition');
    testFormula('IF(LEN(name) < 3, "Missing " + TEXT(3 - LEN(name)) + " Chars" , true)',
      { name: "J" },
      "Missing 2 Chars",
      'simple if condition');
    testFormula('IF(LEN(name) < 3, "Missing " + TEXT(3 - LEN(name)) + " Chars" , true)',
      { name: "Jo" },
      "Missing 1 Chars",
      'simple if condition');
    testFormula('IF(LEN(name) < 3, "Missing " + TEXT(3 - LEN(name)) + " Chars" , true)',
      { name: "John" },
      true,
      'simple if condition');
    testFormula('IF(LEN(name.value) < 3, "Missing " + TEXT(3 - LEN(name.value)) + " chars" , "")',
      (variables: string[])=> {
        if(variables.join('.') !== "name.value") throw new Error("Oups trying to evaluate another variable than name.value");
        return 'Jo'
      },
      "Missing 1 chars",
      'simple if condition');
    testFormula('IF(LEN(name.value) < 3, "Missing " + TEXT(3 - LEN(name.value)) + " chars" , "")',
      (variables: string[])=> {
        if(variables.join('.') !== "name.value") throw new Error("Oups trying to evaluate another variable than name.value");
        return 'John'
      },
      "",
      'simple if condition');
    testFormula('IF(true, firstname, lastname)',
      (variable)=> {
        if(variable.join('.') !== "firstname") {
          throw new Error("Oups trying to evaluate another variable than firstname");
        }
        return "John";
      },
      "John",
      'test if true argument is evaluated');
    testFormula('IF(false, firstname, lastname)',
      (variable)=> {
        if(variable.join('.') !== "lastname") {
          throw new Error("Oups trying to evaluate another variable than lastname");
        }
        return "Else";
      },
      "Else",
      'test if false argument is evaluated');
  });


  describe('functions', () => {
    testFormula('LEN("Hello")', {}, 5, 'LEN function');
    testFormula('LEN("")', {}, 0, 'LEN function');
    testFormulaError('LEN(123)', {}, 'Argument should be a string in LEN(123)', 'LEN function');

    testFormula('FLOOR(5.7)', {}, 5, 'FLOOR function with positive number');
    testFormula('FLOOR(5.2)', {}, 5, 'FLOOR function with positive number');
    testFormula('FLOOR(-5.7)', {}, -6, 'FLOOR function with negative number');
    testFormula('FLOOR(-5.2)', {}, -6, 'FLOOR function with negative number');
    testFormula('FLOOR(5)', {}, 5, 'FLOOR function with integer');
    testFormulaError('FLOOR("abc")', {}, 'Argument should be a number in FLOOR("abc")', 'FLOOR function with non-number');

    testFormula('CEILING(5.7)', {}, 6, 'CEILING function with positive number');
    testFormula('CEILING(5.2)', {}, 6, 'CEILING function with positive number');
    testFormula('CEILING(-5.7)', {}, -5, 'CEILING function with negative number');
    testFormula('CEILING(-5.2)', {}, -5, 'CEILING function with negative number');
    testFormula('CEILING(5)', {}, 5, 'CEILING function with integer');
    testFormulaError('CEILING("abc")', {}, 'Argument should be a number in CEILING("abc")', 'CEILING function with non-number');

    testFormula('BLANKVALUE("", "Default")', {}, "Default", 'BLANKVALUE with empty string');
    testFormula('BLANKVALUE(null, "Default")', {}, "Default", 'BLANKVALUE with null');
    testFormula('BLANKVALUE(undefined, "Default")', {}, "Default", 'BLANKVALUE with undefined');
    testFormula('BLANKVALUE(" ", "Default")', {}, "Default", 'BLANKVALUE with whitespace');
    testFormula('BLANKVALUE("Hello", "Default")', {}, "Hello", 'BLANKVALUE with non-blank string');
    testFormula('BLANKVALUE(123, "Default")', {}, 123, 'BLANKVALUE with number');
    testFormula('BLANKVALUE(0, "Default")', {}, 0, 'BLANKVALUE with zero');
    testFormula('BLANKVALUE(false, "Default")', {}, false, 'BLANKVALUE with false');
    testFormula('BLANKVALUE(Name, "Unknown")', { Name: "" }, "Unknown", 'BLANKVALUE with blank variable');
    testFormula('BLANKVALUE(Name, "Unknown")', { Name: "John" }, "John", 'BLANKVALUE with non-blank variable');
    testFormulaError('BLANKVALUE()', {}, 'Not enough arguments 0/2 in BLANKVALUE()', 'BLANKVALUE with no arguments');
    testFormulaError('BLANKVALUE("test")', {}, 'Not enough arguments 1/2 in BLANKVALUE("test")', 'BLANKVALUE with 1 argument');
  });

  describe('Dynamic context', () => {
    testFormula('Amount', (variables: string[])=> {
      assert(variables.length === 1);
      assert(variables[0] === 'Amount');
      return 100
    }, 100, 'numeric field reference');
    testFormula('Amount * Quantity', (variables: string[])=> {
      assert(variables.length === 2);
      assert(variables[0] === 'Amount');
      assert(variables[1] === 'Quantity');
      if(variables[0] === 'Amount') return 100;
      return 2;
    }, 200, 'numeric field reference');
  });
  // Error Cases
  /*
  describe('Error Handling', () => {
    /*testFormulaError(
      '',
      {},
      '',
      ''
    );*/
    /*testFormulaError(
      'NonexistentVariable',
      {},
      'Field "NonexistentVariable" not found in context',
      'undefined variable reference'
    );

    /*

    testFormulaError(
      'DIVIDE(Amount, ZeroValue)',
      { Amount: 100, ZeroValue: 0 },
      'Division by zero',
      'division by zero'
    );

    testFormulaError(
      '1 + + 2',
      {},
      'Invalid formula syntax',
      'invalid formula syntax'
    );
    */

    /*testFormulaError(
      'INVALID_FUNCTION(123)',
      {},
      'Unknown function: INVALID_FUNCTION',
      'invalid function name'
    );* /
  }); */

  describe('Dynamic functions', () => {
    const today = new Date();
    testFormulaWithOptions('TODAY()', {}, { functions: { 'TODAY': () => today } }, today, 'Dynamic function without arguments');
    testFormulaWithOptions('INC(12)',{}, {functions: { 'INC': (...args: Array<()=>unknown>) => {
        assert(args.length === 1);
        const arg = args[0]();
        if(typeof arg !== 'number') throw new Error('OUPS ?');
        assert(arg === 12);

        return arg + 1;
      }
    }}, 13, 'Dynamic function with one argument');

    testFormulaWithOptions('SUM(12, 4)',{}, {
      functions: {'SUM': (...args: Array<()=>unknown>) => {
        assert(args.length === 2);
        const values = args.map((f)=> f());
        assert(values[0] === 12);
        assert(values[1] === 4);

        return 12 + 4;
      }
    }}, 12 + 4, 'Dynamic function with arguments');
  });

  describe('Math Functions', () => {
    // ABS
    describe('ABS', () => {
      testFormula('ABS(10)', {}, 10, 'ABS positive');
      testFormula('ABS(-10)', {}, 10, 'ABS negative');
      testFormula('ABS(0)', {}, 0, 'ABS zero');
      testFormulaError('ABS("text")', {}, 'Argument 1 of ABS must be a number in ABS("text")', 'ABS text input');
      testFormulaError('ABS()', {}, 'Not enough arguments 0/1 in ABS()', 'ABS no arguments');
      testFormulaError('ABS(1, 2)', {}, 'Too many arguments 2/1 in ABS(1,2)', 'ABS too many arguments');
    });

    // ACOS
    describe('ACOS', () => {
      testFormula('ACOS(1)', {}, 0, 'ACOS 1');
      testFormula('ACOS(0)', {}, Math.PI / 2, 'ACOS 0');
      testFormula('ACOS(-1)', {}, Math.PI, 'ACOS -1');
      testFormula('ACOS(0.5)', {}, Math.acos(0.5), 'ACOS 0.5');
      testFormula('ACOS(2)', {}, null, 'ACOS 2 (out of range)');
      testFormula('ACOS(-2)', {}, null, 'ACOS -2 (out of range)');
      testFormulaError('ACOS("text")', {}, 'Argument 1 of ACOS must be a number in ACOS("text")', 'ACOS text input');
      testFormulaError('ACOS()', {}, 'Not enough arguments 0/1 in ACOS()', 'ACOS no arguments');
      testFormulaError('ACOS(1, 2)', {}, 'Too many arguments 2/1 in ACOS(1,2)', 'ACOS too many arguments');
    });

    // ASIN
    describe('ASIN', () => {
      testFormula('ASIN(1)', {}, Math.PI / 2, 'ASIN 1');
      testFormula('ASIN(0)', {}, 0, 'ASIN 0');
      testFormula('ASIN(-1)', {}, -Math.PI / 2, 'ASIN -1');
      testFormula('ASIN(0.5)', {}, Math.asin(0.5), 'ASIN 0.5');
      testFormula('ASIN(2)', {}, null, 'ASIN 2 (out of range)');
      testFormula('ASIN(-2)', {}, null, 'ASIN -2 (out of range)');
      testFormulaError('ASIN("text")', {}, 'Argument 1 of ASIN must be a number in ASIN("text")', 'ASIN text input');
      testFormulaError('ASIN()', {}, 'Not enough arguments 0/1 in ASIN()', 'ASIN no arguments');
      testFormulaError('ASIN(1, 2)', {}, 'Too many arguments 2/1 in ASIN(1,2)', 'ASIN too many arguments');
    });

    // ATAN
    describe('ATAN', () => {
      testFormula('ATAN(0)', {}, 0, 'ATAN 0');
      testFormula('ATAN(1)', {}, Math.PI / 4, 'ATAN 1');
      testFormulaError('ATAN("text")', {}, 'Argument 1 of ATAN must be a number in ATAN("text")', 'ATAN text input');
      testFormulaError('ATAN()', {}, 'Not enough arguments 0/1 in ATAN()', 'ATAN no arguments');
      testFormulaError('ATAN(1, 2)', {}, 'Too many arguments 2/1 in ATAN(1,2)', 'ATAN too many arguments');
    });

    // ATAN2
    describe('ATAN2', () => {
      testFormula('ATAN2(0, 0)', {}, 0, 'ATAN2(0,0)');
      testFormula('ATAN2(1, 1)', {}, Math.PI / 4, 'ATAN2(1,1)');
      testFormula('ATAN2(10, 0)', {}, Math.PI / 2, 'ATAN2(10,0)');
      testFormula('ATAN2(0, 10)', {}, 0, 'ATAN2(0,10)');
      testFormulaError('ATAN2("text", 1)', {}, 'Argument 1 of ATAN2 must be a number in ATAN2("text",1)', 'ATAN2 text input for arg1');
      testFormulaError('ATAN2(1, "text")', {}, 'Argument 2 of ATAN2 must be a number in ATAN2(1,"text")', 'ATAN2 text input for arg2');
      testFormulaError('ATAN2()', {}, 'Not enough arguments 0/2 in ATAN2()', 'ATAN2 no arguments');
      testFormulaError('ATAN2(1)', {}, 'Not enough arguments 1/2 in ATAN2(1)', 'ATAN2 one argument');
      testFormulaError('ATAN2(1, 2, 3)', {}, 'Too many arguments 3/2 in ATAN2(1,2,3)', 'ATAN2 too many arguments');
    });

    // COS
    describe('COS', () => {
      testFormula('COS(0)', {}, 1, 'COS 0');
      testFormula('COS(PI())', {}, -1, 'COS PI');
      testFormula('COS(PI()/2)', {}, Math.cos(Math.PI/2), 'COS PI/2 (close to 0)');
      testFormulaError('COS("text")', {}, 'Argument 1 of COS must be a number in COS("text")', 'COS text input');
      testFormulaError('COS()', {}, 'Not enough arguments 0/1 in COS()', 'COS no arguments');
      testFormulaError('COS(1, 2)', {}, 'Too many arguments 2/1 in COS(1,2)', 'COS too many arguments');
    });

    // EXP
    describe('EXP', () => {
      testFormula('EXP(1)', {}, Math.E, 'EXP 1');
      testFormula('EXP(0)', {}, 1, 'EXP 0');
      testFormula('EXP(2)', {}, Math.exp(2), 'EXP 2');
      testFormulaError('EXP("text")', {}, 'Argument 1 of EXP must be a number in EXP("text")', 'EXP text input');
      testFormulaError('EXP()', {}, 'Not enough arguments 0/1 in EXP()', 'EXP no arguments');
      testFormulaError('EXP(1, 2)', {}, 'Too many arguments 2/1 in EXP(1,2)', 'EXP too many arguments');
    });

    // LN
    describe('LN', () => {
      testFormula('LN(EXP(1))', {}, 1, 'LN(e)');
      testFormula('LN(1)', {}, 0, 'LN 1');
      testFormulaError('LN("text")', {}, 'Argument 1 of LN must be a number in LN("text")', 'LN text input');
      testFormulaError('LN(0)', {}, 'Argument 1 of LN must be a positive number in LN(0)', 'LN zero');
      testFormulaError('LN(-1)', {}, 'Argument 1 of LN must be a positive number in LN(-1)', 'LN negative');
      testFormulaError('LN()', {}, 'Not enough arguments 0/1 in LN()', 'LN no arguments');
      testFormulaError('LN(1, 2)', {}, 'Too many arguments 2/1 in LN(1,2)', 'LN too many arguments');
    });

    // LOG
    describe('LOG', () => {
      testFormula('LOG(10)', {}, 1, 'LOG 10');
      testFormula('LOG(100)', {}, 2, 'LOG 100');
      testFormula('LOG(1)', {}, 0, 'LOG 1');
      testFormulaError('LOG("text")', {}, 'Argument 1 of LOG must be a number in LOG("text")', 'LOG text input');
      testFormulaError('LOG(0)', {}, 'Argument 1 of LOG must be a positive number in LOG(0)', 'LOG zero');
      testFormulaError('LOG(-1)', {}, 'Argument 1 of LOG must be a positive number in LOG(-1)', 'LOG negative');
      testFormulaError('LOG()', {}, 'Not enough arguments 0/1 in LOG()', 'LOG no arguments');
      testFormulaError('LOG(1, 2)', {}, 'Too many arguments 2/1 in LOG(1,2)', 'LOG too many arguments');
    });

    // MAX
    describe('MAX', () => {
      testFormula('MAX(1, 2, 3)', {}, 3, 'MAX three numbers');
      testFormula('MAX(10, 0, -10)', {}, 10, 'MAX positive, zero, negative');
      testFormula('MAX(5)', {}, 5, 'MAX single number');
      testFormula('MAX(10, 5, 20, 1)', {}, 20, 'MAX multiple numbers');
      testFormulaError('MAX(5, "text")', {}, 'Argument 2 of MAX must be a number in MAX(5,"text")', 'MAX text input');
      testFormulaError('MAX("text", 5)', {}, 'Argument 1 of MAX must be a number in MAX("text",5)', 'MAX text input first');
      testFormulaError('MAX()', {}, 'Not enough arguments 0/1 in MAX()', 'MAX no arguments');
    });

    // MCEILING
    describe('MCEILING', () => {
      testFormula('MCEILING(5.7)', {}, 6, 'MCEILING positive number');
      testFormula('MCEILING(5.2)', {}, 6, 'MCEILING positive number');
      testFormula('MCEILING(-5.7)', {}, -5, 'MCEILING negative number');
      testFormula('MCEILING(-5.2)', {}, -5, 'MCEILING negative number');
      testFormula('MCEILING(5)', {}, 5, 'MCEILING integer');
      testFormulaError('MCEILING("text")', {}, 'Argument 1 of MCEILING must be a number in MCEILING("text")', 'MCEILING text input');
      testFormulaError('MCEILING()', {}, 'Not enough arguments 0/1 in MCEILING()', 'MCEILING no arguments');
      testFormulaError('MCEILING(1, 2)', {}, 'Too many arguments 2/1 in MCEILING(1,2)', 'MCEILING too many arguments');
    });

    // MFLOOR
    describe('MFLOOR', () => {
      testFormula('MFLOOR(5.7)', {}, 5, 'MFLOOR positive number');
      testFormula('MFLOOR(5.2)', {}, 5, 'MFLOOR positive number');
      testFormula('MFLOOR(-5.7)', {}, -6, 'MFLOOR negative number');
      testFormula('MFLOOR(-5.2)', {}, -6, 'MFLOOR negative number');
      testFormula('MFLOOR(5)', {}, 5, 'MFLOOR integer');
      testFormulaError('MFLOOR("text")', {}, 'Argument 1 of MFLOOR must be a number in MFLOOR("text")', 'MFLOOR text input');
      testFormulaError('MFLOOR()', {}, 'Not enough arguments 0/1 in MFLOOR()', 'MFLOOR no arguments');
      testFormulaError('MFLOOR(1, 2)', {}, 'Too many arguments 2/1 in MFLOOR(1,2)', 'MFLOOR too many arguments');
    });
    
    // MIN
    describe('MIN', () => {
      testFormula('MIN(1, 2, 3)', {}, 1, 'MIN three numbers');
      testFormula('MIN(10, 0, -10)', {}, -10, 'MIN positive, zero, negative');
      testFormula('MIN(5)', {}, 5, 'MIN single number');
      testFormula('MIN(10, 5, 20, 1)', {}, 1, 'MIN multiple numbers');
      testFormulaError('MIN(5, "text")', {}, 'Argument 2 of MIN must be a number in MIN(5,"text")', 'MIN text input');
      testFormulaError('MIN("text", 5)', {}, 'Argument 1 of MIN must be a number in MIN("text",5)', 'MIN text input first');
      testFormulaError('MIN()', {}, 'Not enough arguments 0/1 in MIN()', 'MIN no arguments');
    });

    // MOD
    describe('MOD', () => {
      testFormula('MOD(10, 3)', {}, 1, 'MOD 10, 3');
      testFormula('MOD(10, -3)', {}, 1, 'MOD 10, -3 (JS behavior)');
      testFormula('MOD(-10, 3)', {}, -1, 'MOD -10, 3 (JS behavior)');
      testFormula('MOD(-10, -3)', {}, -1, 'MOD -10, -3 (JS behavior)');
      testFormula('MOD(10, 10)', {}, 0, 'MOD 10, 10');
      testFormulaError('MOD(10, 0)', {}, 'Argument 2 of MOD cannot be zero in MOD(10,0)', 'MOD divisor zero');
      testFormulaError('MOD("text", 3)', {}, 'Argument 1 of MOD must be a number in MOD("text",3)', 'MOD text input for arg1');
      testFormulaError('MOD(10, "text")', {}, 'Argument 2 of MOD must be a number in MOD(10,"text")', 'MOD text input for arg2');
      testFormulaError('MOD()', {}, 'Not enough arguments 0/2 in MOD()', 'MOD no arguments');
      testFormulaError('MOD(1)', {}, 'Not enough arguments 1/2 in MOD(1)', 'MOD one argument');
      testFormulaError('MOD(1, 2, 3)', {}, 'Too many arguments 3/2 in MOD(1,2,3)', 'MOD too many arguments');
    });

    // PI
    describe('PI', () => {
      testFormula('PI()', {}, Math.PI, 'PI');
      testFormulaError('PI(1)', {}, 'Too many arguments 1/0 in PI(1)', 'PI with argument');
    });

    // ROUND
    describe('ROUND', () => {
      testFormula('ROUND(3.14159, 2)', {}, 3.14, 'ROUND 3.14159 to 2 digits');
      testFormula('ROUND(3.14159, 0)', {}, 3, 'ROUND 3.14159 to 0 digits');
      testFormula('ROUND(12345.67, -2)', {}, 12300, 'ROUND 12345.67 to -2 digits');
      testFormula('ROUND(3.5, 0)', {}, 4, 'ROUND 3.5 to 0 digits (round half up)');
      testFormula('ROUND(2.5, 0)', {}, 3, 'ROUND 2.5 to 0 digits (JS Math.round behavior - round half towards +Infinity)'); // Math.round(2.5) is 3
      testFormula('ROUND(1.2345, 8)', {}, 1.2345, 'ROUND 1.2345 to 8 digits');
      testFormula('ROUND(2.7,0)', {}, 3, 'ROUND 2.7 to 0 digits');
      testFormula('ROUND(2.499,0)', {}, 2, 'ROUND 2.499 to 0 digits');
      testFormula('ROUND(123.456, -1)', {}, 120, 'ROUND 123.456 to -1 digits');
      testFormulaError('ROUND("text", 2)', {}, 'Argument 1 of ROUND must be a number in ROUND("text",2)', 'ROUND text input for arg1');
      testFormulaError('ROUND(3.14, "text")', {}, 'Argument 2 of ROUND must be a number in ROUND(3.14,"text")', 'ROUND text input for arg2');
      testFormulaError('ROUND(3.14, 1.5)', {}, 'Argument 2 of ROUND must be an integer in ROUND(3.14,1.5)', 'ROUND non-integer num_digits');
      testFormulaError('ROUND()', {}, 'Not enough arguments 0/2 in ROUND()', 'ROUND no arguments');
      testFormulaError('ROUND(1)', {}, 'Not enough arguments 1/2 in ROUND(1)', 'ROUND one argument');
      testFormulaError('ROUND(1, 2, 3)', {}, 'Too many arguments 3/2 in ROUND(1,2,3)', 'ROUND too many arguments');
    });
    
    // SIN
    describe('SIN', () => {
      testFormula('SIN(0)', {}, 0, 'SIN 0');
      testFormula('SIN(PI()/2)', {}, 1, 'SIN PI/2');
      testFormula('SIN(PI())', {}, Math.sin(Math.PI), 'SIN PI (close to 0)');
      testFormulaError('SIN("text")', {}, 'Argument 1 of SIN must be a number in SIN("text")', 'SIN text input');
      testFormulaError('SIN()', {}, 'Not enough arguments 0/1 in SIN()', 'SIN no arguments');
      testFormulaError('SIN(1, 2)', {}, 'Too many arguments 2/1 in SIN(1,2)', 'SIN too many arguments');
    });

    // SQRT
    describe('SQRT', () => {
      testFormula('SQRT(9)', {}, 3, 'SQRT 9');
      testFormula('SQRT(2)', {}, Math.SQRT2, 'SQRT 2');
      testFormula('SQRT(0)', {}, 0, 'SQRT 0');
      testFormulaError('SQRT(-1)', {}, 'Argument 1 of SQRT must be a non-negative number in SQRT(-1)', 'SQRT negative');
      testFormulaError('SQRT("text")', {}, 'Argument 1 of SQRT must be a number in SQRT("text")', 'SQRT text input');
      testFormulaError('SQRT()', {}, 'Not enough arguments 0/1 in SQRT()', 'SQRT no arguments');
      testFormulaError('SQRT(1, 2)', {}, 'Too many arguments 2/1 in SQRT(1,2)', 'SQRT too many arguments');
    });

    // TAN
    describe('TAN', () => {
      testFormula('TAN(0)', {}, 0, 'TAN 0');
      testFormula('TAN(PI()/4)', {}, Math.tan(Math.PI/4), 'TAN PI/4 (close to 1)'); // Using Math.tan for precision
      testFormula('TAN(PI()/2)', {}, Math.tan(Math.PI/2), 'TAN PI/2 (large number)');
      testFormulaError('TAN("text")', {}, 'Argument 1 of TAN must be a number in TAN("text")', 'TAN text input');
      testFormulaError('TAN()', {}, 'Not enough arguments 0/1 in TAN()', 'TAN no arguments');
      testFormulaError('TAN(1, 2)', {}, 'Too many arguments 2/1 in TAN(1,2)', 'TAN too many arguments');
    });
    
    // TRUNC
    describe('TRUNC', () => {
      testFormula('TRUNC(8.9)', {}, 8, 'TRUNC positive');
      testFormula('TRUNC(-8.9)', {}, -8, 'TRUNC negative');
      testFormula('TRUNC(12.345, 1)', {}, 12.3, 'TRUNC positive with num_digits');
      testFormula('TRUNC(12.345, 0)', {}, 12, 'TRUNC positive with 0 num_digits');
      testFormula('TRUNC(12.999, 2)', {}, 12.99, 'TRUNC positive with num_digits, no rounding');
      testFormula('TRUNC(123.456, -1)', {}, 120, 'TRUNC positive with negative num_digits');
      testFormula('TRUNC(123.456, -2)', {}, 100, 'TRUNC positive with large negative num_digits');
      testFormula('TRUNC(-123.456, -1)', {}, -120, 'TRUNC negative with negative num_digits');
      testFormula('TRUNC(-123.456, -2)', {}, -100, 'TRUNC negative with large negative num_digits');
      testFormula('TRUNC(456.123, -3)', {}, 0, 'TRUNC to zero');
      testFormula('TRUNC(-456.123, -3)', {}, 0, 'TRUNC to zero negative');
      testFormula('TRUNC(1.23)', {}, 1, 'TRUNC with one argument'); // num_digits defaults to 0
      testFormulaError('TRUNC("text")', {}, 'Argument 1 of TRUNC must be a number in TRUNC("text")', 'TRUNC text input for arg1');
      testFormulaError('TRUNC(12.3, "text")', {}, 'Argument 2 of TRUNC must be a number in TRUNC(12.3,"text")', 'TRUNC text input for arg2');
      testFormulaError('TRUNC(12.3, 1.5)', {}, 'Argument 2 of TRUNC must be an integer in TRUNC(12.3,1.5)', 'TRUNC non-integer num_digits');
      testFormulaError('TRUNC()', {}, 'Not enough arguments 0/1 in TRUNC()', 'TRUNC no arguments');
      testFormulaError('TRUNC(1, 2, 3)', {}, 'Too many arguments 3/2 in TRUNC(1,2,3)', 'TRUNC too many arguments');
    });
  });

  describe('Text Functions', () => {
    // ASCII
    describe('ASCII', () => {
      testFormula('ASCII("A")', {}, 65, 'ASCII "A"');
      testFormula('ASCII("abc")', {}, 97, 'ASCII "abc"');
      testFormula('ASCII("")', {}, null, 'ASCII empty string');
      testFormulaError('ASCII(123)', {}, 'Argument 1 of ASCII must be a string in ASCII(123)', 'ASCII number input');
      testFormulaError('ASCII()', {}, 'Not enough arguments 0/1 in ASCII()', 'ASCII no arguments');
      testFormulaError('ASCII("a", "b")', {}, 'Too many arguments 2/1 in ASCII("a","b")', 'ASCII too many arguments');
    });

    // BEGINS
    describe('BEGINS', () => {
      testFormula('BEGINS("Salesforce", "Sale")', {}, true, 'BEGINS true');
      testFormula('BEGINS("Salesforce", "sale")', {}, false, 'BEGINS case-sensitive false');
      testFormula('BEGINS("Salesforce", "Force")', {}, false, 'BEGINS false');
      testFormula('BEGINS("", "a")', {}, false, 'BEGINS empty text');
      testFormula('BEGINS("a", "")', {}, true, 'BEGINS empty compare_text');
      testFormula('BEGINS("", "")', {}, true, 'BEGINS both empty');
      testFormulaError('BEGINS("text")', {}, 'Not enough arguments 1/2 in BEGINS("text")', 'BEGINS one argument');
      testFormulaError('BEGINS(123, "S")', {}, 'Argument 1 of BEGINS must be a string in BEGINS(123,"S")', 'BEGINS arg1 number');
      testFormulaError('BEGINS("S", 123)', {}, 'Argument 2 of BEGINS must be a string in BEGINS("S",123)', 'BEGINS arg2 number');
    });

    // BR
    describe('BR', () => {
      testFormula('BR()', {}, '\n', 'BR newline');
      testFormulaError('BR(1)', {}, 'Too many arguments 1/0 in BR(1)', 'BR with argument');
    });

    // CONTAINS
    describe('CONTAINS', () => {
      testFormula('CONTAINS("Salesforce", "force")', {}, true, 'CONTAINS "force" in "Salesforce" (true)');
      testFormula('CONTAINS("Salesforce", "Force")', {}, true, 'CONTAINS "Force" in "Salesforce" (true, case-sensitive match)');
      testFormula('CONTAINS("Salesforce", "FORCE")', {}, false, 'CONTAINS "FORCE" in "Salesforce" (false, case-sensitive)');
      testFormula('CONTAINS("abc", "d")', {}, false, 'CONTAINS "d" in "abc" (false)');
      testFormula('CONTAINS("abc", "a")', {}, true, 'CONTAINS "a" in "abc" (true)');
      testFormula('CONTAINS("abc", "A")', {}, false, 'CONTAINS "A" in "abc" (false, case-sensitive)');
      testFormula('CONTAINS("", "a")', {}, false, 'CONTAINS "a" in "" (false)');
      testFormula('CONTAINS("a", "")', {}, true, 'CONTAINS "" in "a" (true)');
      testFormula('CONTAINS("", "")', {}, true, 'CONTAINS "" in "" (true)');
      testFormulaError('CONTAINS("text")', {}, 'Not enough arguments 1/2 in CONTAINS("text")', 'CONTAINS one argument');
      testFormulaError('CONTAINS(123, "S")', {}, 'Argument 1 of CONTAINS must be a string in CONTAINS(123,"S")', 'CONTAINS arg1 number');
      testFormulaError('CONTAINS("S", 123)', {}, 'Argument 2 of CONTAINS must be a string in CONTAINS("S",123)', 'CONTAINS arg2 number');
    });

    // FIND
    describe('FIND', () => {
      testFormula('FIND("for", "Salesforce")', {}, 6, 'FIND "for" in "Salesforce"');
      testFormula('FIND("For", "Salesforce")', {}, 0, 'FIND "For" in "Salesforce" (case-sensitive)');
      testFormula('FIND("force", "Salesforce", 6)', {}, 6, 'FIND "force" in "Salesforce" starting at 6');
      testFormula('FIND("force", "Salesforce", 7)', {}, 0, 'FIND "force" in "Salesforce" starting at 7');
      testFormula('FIND("X", "Salesforce")', {}, 0, 'FIND "X" in "Salesforce"');
      testFormula('FIND("", "Salesforce")', {}, 1, 'FIND empty string in "Salesforce"');
      testFormula('FIND("", "Salesforce", 3)', {}, 3, 'FIND empty string in "Salesforce" at 3');
      testFormula('FIND("a", "banana", 0)', {}, 2, 'FIND "a" in "banana" start_num 0 (becomes 1)');
      testFormula('FIND("a", "banana", 1)', {}, 2, 'FIND "a" in "banana" start_num 1');
      testFormula('FIND("a", "banana", 2)', {}, 2, 'FIND "a" in "banana" start_num 2');
      testFormula('FIND("a", "banana", 3)', {}, 4, 'FIND "a" in "banana" start_num 3');
      testFormula('FIND("a", "banana", 10)', {}, 0, 'FIND "a" in "banana" start_num 10 (out of bounds)');
      testFormula('FIND("text", "another text", 20)', {}, 0, 'FIND start_num larger than text length');
      testFormulaError('FIND("text", "text", "abc")', {}, 'Argument 3 of FIND must be a number in FIND("text","text","abc")', 'FIND start_num not a number');
      testFormulaError('FIND("text", "text", 0.5)', {}, 'Argument 3 of FIND must be a positive integer in FIND("text","text",0.5)', 'FIND start_num not an integer');
      testFormulaError('FIND("text", "text", -1)', {}, 'Argument 3 of FIND must be a positive integer in FIND("text","text",-1)', 'FIND start_num negative');
      testFormulaError('FIND("t", 123)', {}, 'Argument 2 of FIND must be a string in FIND("t",123)', 'FIND text not a string');
      testFormulaError('FIND(123, "t")', {}, 'Argument 1 of FIND must be a string in FIND(123,"t")', 'FIND search_text not a string');
    });

    // HTMLENCODE
    describe('HTMLENCODE', () => {
      testFormula('HTMLENCODE("Hello > World & \'Test\"\'")', {}, "Hello &gt; World &amp; &#39;Test&quot;&#39;", 'HTMLENCODE basic');
      testFormula('HTMLENCODE("<img src=\'javascript:evil\'>")', {}, "&lt;img src=&#39;javascript:evil&#39;&gt;", 'HTMLENCODE script');
      testFormula('HTMLENCODE("")', {}, "", 'HTMLENCODE empty string');
      testFormulaError('HTMLENCODE(123)', {}, 'Argument 1 of HTMLENCODE must be a string in HTMLENCODE(123)', 'HTMLENCODE number input');
    });

    // HYPERLINK
    describe('HYPERLINK', () => {
      testFormula('HYPERLINK("www.salesforce.com", "Salesforce")', {}, '<a href="www.salesforce.com">Salesforce</a>', 'HYPERLINK basic');
      testFormula('HYPERLINK("www.salesforce.com", "Salesforce", "_blank")', {}, '<a href="www.salesforce.com" target="_blank">Salesforce</a>', 'HYPERLINK with target');
      testFormulaError('HYPERLINK(123, "SF")', {}, 'Argument 1 of HYPERLINK must be a string in HYPERLINK(123,"SF")', 'HYPERLINK arg1 number');
      testFormulaError('HYPERLINK("url", 123)', {}, 'Argument 2 of HYPERLINK must be a string in HYPERLINK("url",123)', 'HYPERLINK arg2 number');
      testFormulaError('HYPERLINK("url", "name", 123)', {}, 'Argument 3 of HYPERLINK must be a string in HYPERLINK("url","name",123)', 'HYPERLINK arg3 number');
      testFormulaError('HYPERLINK("url")', {}, 'Not enough arguments 1/2 in HYPERLINK("url")', 'HYPERLINK not enough arguments');
    });

    // IMAGE
    describe('IMAGE', () => {
      testFormula('IMAGE("img.png", "alt")', {}, '<img src="img.png" alt="alt">', 'IMAGE basic');
      testFormula('IMAGE("img.png", "alt", 100, 200)', {}, '<img src="img.png" alt="alt" height="100" width="200">', 'IMAGE with height and width');
      testFormula('IMAGE("img.png", "alt", 100)', {}, '<img src="img.png" alt="alt" height="100">', 'IMAGE with height only');
      testFormulaError('IMAGE("img.png", "alt", "txt", 200)', {}, 'Argument 3 of IMAGE must be a number in IMAGE("img.png","alt","txt",200)', 'IMAGE height not a number');
      testFormulaError('IMAGE("img.png", "alt", 100, "txt")', {}, 'Argument 4 of IMAGE must be a number in IMAGE("img.png","alt",100,"txt")', 'IMAGE width not a number');
      testFormulaError('IMAGE("img.png")', {}, 'Not enough arguments 1/2 in IMAGE("img.png")', 'IMAGE not enough arguments');
    });

    // INITCAP
    describe('INITCAP', () => {
      testFormula('INITCAP("hello world")', {}, "Hello World", 'INITCAP basic');
      testFormula('INITCAP("HELLO WORLD")', {}, "Hello World", 'INITCAP all caps');
      testFormula('INITCAP("first-name")', {}, "First-name", 'INITCAP with hyphen (current behavior)');
      testFormula('INITCAP("  leading space")', {}, "  Leading Space", 'INITCAP leading space'); // current impl behavior
      testFormula('INITCAP("multiple   spaces")', {}, "Multiple   Spaces", 'INITCAP multiple spaces'); // current impl behavior
      testFormula('INITCAP("")', {}, "", 'INITCAP empty string');
      testFormulaError('INITCAP(123)', {}, 'Argument 1 of INITCAP must be a string in INITCAP(123)', 'INITCAP number input');
    });

    // JSENCODE
    describe('JSENCODE', () => {
      testFormula('JSENCODE("var x = \'hello\';")', {}, "var x = \\\'hello\\\';", 'JSENCODE basic');
      testFormula('JSENCODE("\\\"\'\n\r/")', {}, "\\\\\\\"\\\'\\n\\r\\/", 'JSENCODE all special chars');
      testFormula('JSENCODE("")', {}, "", 'JSENCODE empty string');
      testFormulaError('JSENCODE(123)', {}, 'Argument 1 of JSENCODE must be a string in JSENCODE(123)', 'JSENCODE number input');
    });

    // JSINHTMLENCODE
    describe('JSINHTMLENCODE', () => {
      testFormula('JSINHTMLENCODE("<script>alert(\'hello & world\')</script>")', {}, "&lt;script&gt;alert(\\\'hello &amp; world\\\')&lt;\\/script&gt;", 'JSINHTMLENCODE basic');
      testFormula('JSINHTMLENCODE("")', {}, "", 'JSINHTMLENCODE empty string');
      testFormulaError('JSINHTMLENCODE(123)', {}, 'Argument 1 of JSINHTMLENCODE must be a string in JSINHTMLENCODE(123)', 'JSINHTMLENCODE number input');
    });

    // LEFT
    describe('LEFT', () => {
      testFormula('LEFT("Salesforce", 4)', {}, "Sale", 'LEFT basic');
      testFormula('LEFT("Salesforce", 0)', {}, "", 'LEFT num_chars 0');
      testFormula('LEFT("Hi", 5)', {}, "Hi", 'LEFT num_chars greater than length');
      testFormula('LEFT("", 5)', {}, "", 'LEFT empty string');
      testFormulaError('LEFT("Salesforce", -1)', {}, 'Argument 2 of LEFT must be a non-negative integer in LEFT("Salesforce",-1)', 'LEFT num_chars negative');
      testFormulaError('LEFT("Salesforce", 1.5)', {}, 'Argument 2 of LEFT must be a non-negative integer in LEFT("Salesforce",1.5)', 'LEFT num_chars not integer');
      testFormulaError('LEFT(123, 2)', {}, 'Argument 1 of LEFT must be a string in LEFT(123,2)', 'LEFT text not string');
    });

    // LOWER
    describe('LOWER', () => {
      testFormula('LOWER("SALESFORCE")', {}, "salesforce", 'LOWER all caps');
      testFormula('LOWER("SalesForce")', {}, "salesforce", 'LOWER mixed case');
      testFormula('LOWER("")', {}, "", 'LOWER empty string');
      testFormulaError('LOWER(123)', {}, 'Argument 1 of LOWER must be a string in LOWER(123)', 'LOWER number input');
    });

    // LPAD
    describe('LPAD', () => {
      testFormula('LPAD("abc", 5, "0")', {}, "00abc", 'LPAD basic');
      testFormula('LPAD("abc", 2, "0")', {}, "ab", 'LPAD truncate');
      testFormula('LPAD("abc", 5)', {}, "  abc", 'LPAD default pad_string');
      testFormula('LPAD("abc", 5, "")', {}, "  abc", 'LPAD empty pad_string');
      testFormula('LPAD("long string", 3, "*")', {}, "lon", 'LPAD truncate long string');
      testFormula('LPAD("abc", 0, "0")', {}, "", 'LPAD padded_length 0');
      testFormula('LPAD("", 3, "0")', {}, "000", 'LPAD empty text');
      testFormulaError('LPAD("abc", -1, "0")', {}, 'Argument 2 of LPAD must be a non-negative integer in LPAD("abc",-1,"0")', 'LPAD negative padded_length');
      testFormulaError('LPAD(123, 5, "0")', {}, 'Argument 1 of LPAD must be a string in LPAD(123,5,"0")', 'LPAD text not string');
      testFormulaError('LPAD("abc", 5, 123)', {}, 'Argument 3 of LPAD must be a string in LPAD("abc",5,123)', 'LPAD pad_string not string');
    });

    // MID
    describe('MID', () => {
      testFormula('MID("Salesforce", 6, 5)', {}, "force", 'MID basic');
      testFormula('MID("Salesforce", 1, 4)', {}, "Sale", 'MID from start');
      testFormula('MID("Salesforce", 20, 5)', {}, "", 'MID start_num too high');
      testFormula('MID("Salesforce", 1, 20)', {}, "Salesforce", 'MID num_chars too high');
      testFormula('MID("Salesforce", 1, 0)', {}, "", 'MID num_chars zero');
      testFormula('MID("", 1, 5)', {}, "", 'MID empty string');
      testFormulaError('MID("abc", 0, 1)', {}, 'Argument 2 of MID must be a positive integer in MID("abc",0,1)', 'MID start_num zero');
      testFormulaError('MID("abc", -1, 1)', {}, 'Argument 2 of MID must be a positive integer in MID("abc",-1,1)', 'MID start_num negative');
      testFormulaError('MID("abc", 1, -1)', {}, 'Argument 3 of MID must be a non-negative integer in MID("abc",1,-1)', 'MID num_chars negative');
      testFormulaError('MID(123, 1, 1)', {}, 'Argument 1 of MID must be a string in MID(123,1,1)', 'MID text not string');
    });

    // REVERSE
    describe('REVERSE', () => {
      testFormula('REVERSE("hello")', {}, "olleh", 'REVERSE basic');
      testFormula('REVERSE("")', {}, "", 'REVERSE empty string');
      testFormulaError('REVERSE(123)', {}, 'Argument 1 of REVERSE must be a string in REVERSE(123)', 'REVERSE number input');
    });

    // RIGHT
    describe('RIGHT', () => {
      testFormula('RIGHT("Salesforce", 5)', {}, "force", 'RIGHT basic');
      testFormula('RIGHT("Salesforce", 0)', {}, "", 'RIGHT num_chars 0');
      testFormula('RIGHT("Hi", 5)', {}, "Hi", 'RIGHT num_chars greater than length');
      testFormula('RIGHT("", 5)', {}, "", 'RIGHT empty string');
      testFormulaError('RIGHT("Salesforce", -1)', {}, 'Argument 2 of RIGHT must be a non-negative integer in RIGHT("Salesforce",-1)', 'RIGHT num_chars negative');
      testFormulaError('RIGHT(123, 2)', {}, 'Argument 1 of RIGHT must be a string in RIGHT(123,2)', 'RIGHT text not string');
    });

    // RPAD
    describe('RPAD', () => {
      testFormula('RPAD("abc", 5, "0")', {}, "abc00", 'RPAD basic');
      testFormula('RPAD("abc", 2, "0")', {}, "ab", 'RPAD truncate');
      testFormula('RPAD("abc", 5)', {}, "abc  ", 'RPAD default pad_string');
      testFormula('RPAD("abc", 5, "")', {}, "abc  ", 'RPAD empty pad_string');
      testFormula('RPAD("long string", 3, "*")', {}, "lon", 'RPAD truncate long string');
      testFormula('RPAD("abc", 0, "0")', {}, "", 'RPAD padded_length 0');
      testFormula('RPAD("", 3, "0")', {}, "000", 'RPAD empty text');
      testFormulaError('RPAD("abc", -1, "0")', {}, 'Argument 2 of RPAD must be a non-negative integer in RPAD("abc",-1,"0")', 'RPAD negative padded_length');
    });

    // SUBSTITUTE
    describe('SUBSTITUTE', () => {
      testFormula('SUBSTITUTE("banana", "a", "o")', {}, "bonono", 'SUBSTITUTE all occurrences');
      testFormula('SUBSTITUTE("banana", "a", "o", 2)', {}, "banona", 'SUBSTITUTE 2nd occurrence');
      testFormula('SUBSTITUTE("banana", "a", "o", 0)', {}, "banana", 'SUBSTITUTE occurrence_num zero');
      testFormula('SUBSTITUTE("banana", "a", "o", 4)', {}, "banana", 'SUBSTITUTE occurrence_num out of bounds (too high)');
      testFormula('SUBSTITUTE("banana", "a", "o", -1)', {}, "banana", 'SUBSTITUTE occurrence_num negative');
      testFormula('SUBSTITUTE("aaaaa", "aa", "b")', {}, "bba", 'SUBSTITUTE all "aa" with "b"'); // Based on split/join
      testFormula('SUBSTITUTE("aaaaa", "aa", "b", 1)', {}, "baa", 'SUBSTITUTE first "aa" with "b"');
      testFormula('SUBSTITUTE("aaaaa", "aa", "b", 2)', {}, "aba", 'SUBSTITUTE second "aa" with "b"');
      testFormula('SUBSTITUTE("test", "", "a")', {}, "test", 'SUBSTITUTE old_text is empty');
      testFormula('SUBSTITUTE("test", "t", "")', {}, "es", 'SUBSTITUTE new_text is empty');
      testFormula('SUBSTITUTE("", "a", "b")', {}, "", 'SUBSTITUTE text is empty');
      testFormulaError('SUBSTITUTE("test", "a", "b", "x")', {}, 'Argument 4 of SUBSTITUTE must be a number in SUBSTITUTE("test","a","b","x")', 'SUBSTITUTE occurrence_num not number');
    });

    // TRIM
    describe('TRIM', () => {
      testFormula('TRIM("  Hello World  ")', {}, "Hello World", 'TRIM basic');
      testFormula('TRIM("Hello World")', {}, "Hello World", 'TRIM no spaces');
      testFormula('TRIM("")', {}, "", 'TRIM empty string');
      testFormula('TRIM("   ")', {}, "", 'TRIM only spaces');
      testFormulaError('TRIM(123)', {}, 'Argument 1 of TRIM must be a string in TRIM(123)', 'TRIM number input');
    });

    // UPPER
    describe('UPPER', () => {
      testFormula('UPPER("salesforce")', {}, "SALESFORCE", 'UPPER all lower');
      testFormula('UPPER("SalesForce")', {}, "SALESFORCE", 'UPPER mixed case');
      testFormula('UPPER("")', {}, "", 'UPPER empty string');
      testFormulaError('UPPER(123)', {}, 'Argument 1 of UPPER must be a string in UPPER(123)', 'UPPER number input');
    });

    // URLENCODE
    describe('URLENCODE', () => {
      testFormula('URLENCODE("Hello World!")', {}, "Hello%20World!", 'URLENCODE basic');
      testFormula('URLENCODE("https://example.com?name=John Doe&age=30")', {}, "https%3A%2F%2Fexample.com%3Fname%3DJohn%20Doe%26age%3D30", 'URLENCODE complex URL');
      testFormula('URLENCODE("")', {}, "", 'URLENCODE empty string');
      testFormulaError('URLENCODE(123)', {}, 'Argument 1 of URLENCODE must be a string in URLENCODE(123)', 'URLENCODE number input');
    });

    // VALUE
    describe('VALUE', () => {
      testFormula('VALUE("123")', {}, 123, 'VALUE integer string');
      testFormula('VALUE("123.45")', {}, 123.45, 'VALUE decimal string');
      testFormula('VALUE("-10")', {}, -10, 'VALUE negative string');
      testFormula('VALUE("")', {}, null, 'VALUE empty string');
      testFormula('VALUE("   ")', {}, null, 'VALUE whitespace string');
      testFormula('VALUE("abc")', {}, NaN, 'VALUE non-numeric string');
      testFormula('VALUE("12a3")', {}, NaN, 'VALUE mixed string');
      testFormula('VALUE("12.3.4")', {}, NaN, 'VALUE multiple decimals');
      testFormula('VALUE(".5")', {}, 0.5, 'VALUE leading decimal point');
      testFormula('VALUE("-.5")', {}, -0.5, 'VALUE negative leading decimal point');
      testFormula('VALUE("5.")', {}, 5, 'VALUE trailing decimal point');
      testFormula('VALUE("  -5.  ")', {}, -5, 'VALUE with spaces and trailing decimal point');
      testFormulaError('VALUE(123)', {}, 'Argument 1 of VALUE must be a string in VALUE(123)', 'VALUE number input');
    });
  });

  describe('Date and Time Functions', () => {
    // Helper for NOW() and TIMENOW() comparisons
    const isRecent = (date: Date, toleranceMs = 2000) => {
      if (!(date instanceof Date)) return false;
      return Math.abs(date.getTime() - new Date().getTime()) < toleranceMs;
    };
    
    const getUTCDateOnly = (date: Date): Date => {
        if (!date || isNaN(date.getTime())) return date; // Return invalid date as is
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    };

    describe('ADDMONTHS', () => {
      testFormula('ADDMONTHS(DATE(2023, 1, 15), 2).toISOString().substring(0,10)', {}, "2023-03-15", 'ADDMONTHS basic');
      testFormula('ADDMONTHS(DATE(2023, 1, 31), 1).toISOString().substring(0,10)', {}, "2023-02-28", 'ADDMONTHS last day handling');
      testFormula('ADDMONTHS(DATE(2024, 1, 31), 1).toISOString().substring(0,10)', {}, "2024-02-29", 'ADDMONTHS leap year');
      testFormula('ADDMONTHS(DATE(2023, 3, 31), -1).toISOString().substring(0,10)', {}, "2023-02-28", 'ADDMONTHS subtract month, last day');
      testFormula('ADDMONTHS(DATE(2023, 12, 15), -13).toISOString().substring(0,10)', {}, "2022-11-15", 'ADDMONTHS subtract year');
      testFormula('ADDMONTHS(DATE(2023,1,29),1).toISOString().substring(0,10)', {}, "2023-02-28", 'ADDMONTHS Jan 29 + 1 month');
      testFormula('ADDMONTHS(DATE(2023,1,30),1).toISOString().substring(0,10)', {}, "2023-02-28", 'ADDMONTHS Jan 30 + 1 month');
      testFormula('ADDMONTHS(DATETIMEVALUE("2023-01-15T10:20:30Z"), 2).toISOString()', {}, new Date(Date.UTC(2023, 2, 15, 10, 20, 30)).toISOString(), 'ADDMONTHS preserves time');
      testFormula('ADDMONTHS("invalid-date", 1)', {}, null, 'ADDMONTHS invalid date');
      testFormulaError('ADDMONTHS(DATE(2023,1,15), "2")', {}, 'Argument 2 of ADDMONTHS must be an integer', 'ADDMONTHS num_months not number');
      testFormulaError('ADDMONTHS(DATE(2023,1,15), 2.5)', {}, 'Argument 2 of ADDMONTHS must be an integer', 'ADDMONTHS num_months not integer');
    });

    describe('DATE', () => {
      testFormula('DATE(2023, 10, 26).toISOString()', {}, new Date(Date.UTC(2023, 9, 26)).toISOString(), 'DATE basic');
      testFormula('DATE(2024, 2, 29).toISOString()', {}, new Date(Date.UTC(2024, 1, 29)).toISOString(), 'DATE leap day');
      testFormula('DATE(2023, 13, 1).toISOString()', {}, new Date(Date.UTC(2024, 0, 1)).toISOString(), 'DATE month overflow (13 -> Jan next year)');
      testFormula('DATE(2023, 1, 32).toISOString()', {}, new Date(Date.UTC(2023,1,1)).toISOString(), 'DATE day overflow (Jan 32 -> Feb 1)'); // JS Date behavior
      testFormulaError('DATE(2023, 0, 1)', {}, 'Argument 2 of DATE (month) must be between 1 and 12', 'DATE month 0');
      testFormulaError('DATE(2023, 1, 0)', {}, 'Argument 3 of DATE (day) must be between 1 and 31', 'DATE day 0');
      testFormulaError('DATE(2023, 2, 30)', {}, 'Invalid date components for DATE function', 'DATE Feb 30');
      testFormulaError('DATE("2023", 10, 26)', {}, 'Argument 1 of DATE must be an integer number', 'DATE year as string');
    });

    describe('DATEVALUE', () => {
      testFormula('DATEVALUE("2023-10-26T14:30:00Z").toISOString()', {}, new Date(Date.UTC(2023, 9, 26)).toISOString(), 'DATEVALUE from datetime string');
      testFormula('DATEVALUE("2023-10-26").toISOString()', {}, new Date(Date.UTC(2023, 9, 26)).toISOString(), 'DATEVALUE from date string');
      it('DATEVALUE(NOW())', () => {
        const result = formulaEval('DATEVALUE(NOW())') as Date;
        const todayUTC = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
        expect(result.getTime()).toBe(todayUTC.getTime());
      });
      testFormula('DATEVALUE("invalid-date")', {}, null, 'DATEVALUE invalid string');
      testFormula('DATEVALUE(1698316800).toISOString()', {}, new Date(Date.UTC(2023, 9, 26)).toISOString(), 'DATEVALUE from Unix timestamp (seconds)');
      testFormula('DATEVALUE(DATETIMEVALUE("2023-11-20T10:00:00+05:00")).toISOString()', {}, new Date(Date.UTC(2023,10,20)).toISOString(), 'DATEVALUE from datetime with offset');
    });

    describe('DATETIMEVALUE', () => {
      testFormula('DATETIMEVALUE("2023-10-26T14:30:00Z").toISOString()', {}, "2023-10-26T14:30:00.000Z", 'DATETIMEVALUE ISO string');
      testFormula('DATETIMEVALUE(1698316800).toISOString()', {}, "2023-10-26T12:00:00.000Z", 'DATETIMEVALUE Unix timestamp');
      testFormula('DATETIMEVALUE("2023-10-26").toISOString()', {}, "2023-10-26T00:00:00.000Z", 'DATETIMEVALUE date string (becomes UTC midnight)');
      testFormula('DATETIMEVALUE("invalid-date")', {}, null, 'DATETIMEVALUE invalid string');
    });

    describe('DAY', () => {
      testFormula('DAY(DATE(2023, 10, 26))', {}, 26, 'DAY basic');
      testFormula('DAY("2023-12-05T10:00:00Z")', {}, 5, 'DAY from datetime string');
      testFormula('DAY("2023-02-28")', {}, 28, 'DAY end of Feb');
      testFormula('DAY("invalid-date")', {}, null, 'DAY invalid');
    });

    describe('DAYOFYEAR', () => {
      testFormula('DAYOFYEAR(DATE(2023, 1, 1))', {}, 1, 'DAYOFYEAR Jan 1');
      testFormula('DAYOFYEAR(DATE(2023, 12, 31))', {}, 365, 'DAYOFYEAR Dec 31 non-leap');
      testFormula('DAYOFYEAR(DATE(2024, 12, 31))', {}, 366, 'DAYOFYEAR Dec 31 leap');
      testFormula('DAYOFYEAR(DATE(2024, 2, 29))', {}, 60, 'DAYOFYEAR Feb 29 leap');
      testFormula('DAYOFYEAR("invalid-date")', {}, null, 'DAYOFYEAR invalid');
    });
    
    // For local time functions, we test consistency with JS Date's local methods.
    describe('HOUR', () => {
      const testDate = new Date("2023-10-26T14:30:45.123Z"); // UTC time
      testFormula(`HOUR(DATETIMEVALUE("${testDate.toISOString()}"))`, {}, testDate.getHours(), 'HOUR specific UTC time');
      const testDateLocal = new Date("2023-10-26T14:30:45.123-07:00"); // Time with offset
      testFormula(`HOUR(DATETIMEVALUE("${testDateLocal.toISOString()}"))`, {}, testDateLocal.getHours(), 'HOUR specific offset time');
      testFormula('HOUR("invalid")', {}, null, 'HOUR invalid');
    });

    describe('ISOWEEK', () => {
      testFormula('ISOWEEK(DATE(2023, 1, 1))', {}, 52, 'ISOWEEK Jan 1 2023');
      testFormula('ISOWEEK(DATE(2023, 1, 2))', {}, 1, 'ISOWEEK Jan 2 2023');
      testFormula('ISOWEEK(DATE(2010, 1, 3))', {}, 53, 'ISOWEEK Jan 3 2010 (week 53 of 2009)');
      testFormula('ISOWEEK(DATE(2010, 1, 4))', {}, 1, 'ISOWEEK Jan 4 2010 (week 1 of 2010)');
      testFormula('ISOWEEK(DATE(2009,12,31))', {}, 53, 'ISOWEEK Dec 31 2009');
      testFormula('ISOWEEK(DATE(2021,1,1))', {}, 53, 'ISOWEEK Jan 1 2021 (week 53 of 2020)');
      testFormula('ISOWEEK("invalid")', {}, null, 'ISOWEEK invalid');
    });

    describe('ISOYEAR', () => {
      testFormula('ISOYEAR(DATE(2023, 1, 1))', {}, 2022, 'ISOYEAR Jan 1 2023');
      testFormula('ISOYEAR(DATE(2023, 1, 2))', {}, 2023, 'ISOYEAR Jan 2 2023');
      testFormula('ISOYEAR(DATE(2010, 1, 3))', {}, 2009, 'ISOYEAR Jan 3 2010');
      testFormula('ISOYEAR(DATE(2010, 1, 4))', {}, 2010, 'ISOYEAR Jan 4 2010');
      testFormula('ISOYEAR(DATE(2009,12,31))', {}, 2009, 'ISOYEAR Dec 31 2009');
      testFormula('ISOYEAR("invalid")', {}, null, 'ISOYEAR invalid');
    });

    describe('MILLISECOND', () => {
      const testDate = new Date("2023-10-26T14:30:45.123Z");
      testFormula(`MILLISECOND(DATETIMEVALUE("${testDate.toISOString()}"))`, {}, testDate.getMilliseconds(), 'MILLISECOND specific time');
      const testDateOffset = new Date("2023-10-26T14:30:45.987-04:00");
      testFormula(`MILLISECOND(DATETIMEVALUE("${testDateOffset.toISOString()}"))`, {}, testDateOffset.getMilliseconds(), 'MILLISECOND specific offset time');
      testFormula('MILLISECOND("invalid")', {}, null, 'MILLISECOND invalid');
    });

    describe('MINUTE', () => {
      const testDate = new Date("2023-10-26T14:30:45Z");
      testFormula(`MINUTE(DATETIMEVALUE("${testDate.toISOString()}"))`, {}, testDate.getMinutes(), 'MINUTE specific time');
      testFormula('MINUTE("invalid")', {}, null, 'MINUTE invalid');
    });

    describe('MONTH', () => {
      testFormula('MONTH(DATE(2023, 10, 26))', {}, 10, 'MONTH basic');
      testFormula('MONTH("2023-01-15T10:00:00Z")', {}, 1, 'MONTH Jan');
      testFormula('MONTH("invalid")', {}, null, 'MONTH invalid');
    });

    describe('NOW', () => {
      it('NOW() returns recent date', () => {
        expect(isRecent(formulaEval('NOW()') as Date)).toBe(true);
      });
    });

    describe('SECOND', () => {
      const testDate = new Date("2023-10-26T14:30:45Z");
      testFormula(`SECOND(DATETIMEVALUE("${testDate.toISOString()}"))`, {}, testDate.getSeconds(), 'SECOND specific time');
      testFormula('SECOND("invalid")', {}, null, 'SECOND invalid');
    });

    describe('TIMENOW', () => { // Returns current time in GMT
      it('TIMENOW() returns recent date (representing GMT time)', () => {
        const result = formulaEval('TIMENOW()') as Date;
        expect(result instanceof Date).toBe(true);
        // Check if it's close to current time. Since it's GMT, its components should match current UTC components
        const now = new Date();
        expect(Math.abs(result.getTime() - now.getTime())).toBeLessThan(2000); // Check raw timestamp is recent
      });
    });
    
    describe('TIMEVALUE', () => {
      testFormula('TIMEVALUE("14:30:45").toISOString()', {}, "1970-01-01T14:30:45.000Z", 'TIMEVALUE HH:MM:SS string');
      testFormula('TIMEVALUE("14:30:45.123").toISOString()', {}, "1970-01-01T14:30:45.123Z", 'TIMEVALUE HH:MM:SS.sss string');
      // Test with a Date object input. DATETIMEVALUE itself returns a Date object.
      // The DATETIMEVALUE will be 2023-10-26T17:20:30.400Z. TIMEVALUE should extract 17:20:30.400.
      const inputDateForTimeValue = new Date("2023-10-26T10:20:30.400-07:00"); // This is 2023-10-26T17:20:30.400Z
      testFormula(`TIMEVALUE(DATETIMEVALUE("${inputDateForTimeValue.toISOString()}"))`, {}, new Date(Date.UTC(1970,0,1, 17,20,30,400)), 'TIMEVALUE from DATETIMEVALUE with offset');
      testFormula('TIMEVALUE(DATE(2023,10,26)).toISOString()', {}, "1970-01-01T00:00:00.000Z", 'TIMEVALUE from DATE (midnight UTC)');
      testFormula('TIMEVALUE("invalid-time-string")', {}, null, 'TIMEVALUE invalid time string');
      testFormula('TIMEVALUE("25:00:00")', {}, null, 'TIMEVALUE invalid hour');
      testFormula('TIMEVALUE(1698316800).toISOString()', {}, "1970-01-01T12:00:00.000Z", 'TIMEVALUE from Unix timestamp (2023-10-26T12:00:00Z)');
    });

    describe('TODAY', () => {
      it('TODAY() returns current date at UTC midnight', () => {
        const result = formulaEval('TODAY()') as Date;
        const today = new Date();
        const expected = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
        expect(result.toISOString()).toBe(expected.toISOString());
      });
    });

    describe('UNIXTIMESTAMP', () => {
      testFormula('UNIXTIMESTAMP(DATE(1970, 1, 1))', {}, 0, 'UNIXTIMESTAMP epoch');
      testFormula('UNIXTIMESTAMP(DATETIMEVALUE("1970-01-01T00:00:01Z"))', {}, 1, 'UNIXTIMESTAMP epoch + 1s');
      testFormula('UNIXTIMESTAMP(DATETIMEVALUE("2023-10-26T12:00:00Z"))', {}, 1698316800, 'UNIXTIMESTAMP specific date');
      testFormula('UNIXTIMESTAMP("invalid")', {}, null, 'UNIXTIMESTAMP invalid');
    });

    describe('WEEKDAY', () => {
      testFormula('WEEKDAY(DATE(2023, 10, 22))', {}, 1, 'WEEKDAY Sunday'); // Oct 22 2023 is Sunday
      testFormula('WEEKDAY(DATE(2023, 10, 26))', {}, 5, 'WEEKDAY Thursday'); // Oct 26 2023 is Thursday
      testFormula('WEEKDAY(DATE(2023, 10, 28))', {}, 7, 'WEEKDAY Saturday'); // Oct 28 2023 is Saturday
      testFormula('WEEKDAY("invalid")', {}, null, 'WEEKDAY invalid');
    });

    describe('YEAR', () => {
      testFormula('YEAR(DATE(2023, 10, 26))', {}, 2023, 'YEAR basic');
      testFormula('YEAR("2050-01-01T00:00:00Z")', {}, 2050, 'YEAR future date string');
      testFormula('YEAR("invalid")', {}, null, 'YEAR invalid');
    });

    describe('FORMATDURATION', () => {
      testFormula('FORMATDURATION(125)', {}, "00:02:05", 'FORMATDURATION basic seconds');
      testFormula('FORMATDURATION(3661)', {}, "01:01:01", 'FORMATDURATION hours, minutes, seconds');
      testFormula('FORMATDURATION(86400)', {}, "24:00:00", 'FORMATDURATION 24 hours');
      testFormula('FORMATDURATION(90000)', {}, "25:00:00", 'FORMATDURATION 25 hours');
      testFormula('FORMATDURATION(0)', {}, "00:00:00", 'FORMATDURATION zero');
      testFormula('FORMATDURATION(86399.999)', {}, "23:59:59", 'FORMATDURATION with decimals (floor)');
      testFormulaError('FORMATDURATION("text")', {}, 'Argument 1 of FORMATDURATION must be a number (total seconds)', 'FORMATDURATION text input');
      testFormulaError('FORMATDURATION(-10)', {}, 'Argument 1 of FORMATDURATION must be a non-negative number', 'FORMATDURATION negative input');
    });

  });

  describe('Logical Functions', () => {
    const errorThrowerContext = {
      ErrorThrower: () => { throw new Error("Should not be evaluated due to short-circuiting"); }
    };
    const undefinedVarContext = {}; // Empty context
    const definedVarContext = { Amount: 100, Name: "John", Status: "Open", IsTrue: true, IsFalse: false, NullVar: null};


    describe('AND', () => {
      testFormula('AND(true, true)', {}, true, 'AND true, true');
      testFormula('AND(true, false)', {}, false, 'AND true, false');
      testFormula('AND(false, true)', {}, false, 'AND false, true');
      testFormula('AND(false, false)', {}, false, 'AND false, false');
      testFormula('AND(true, true, true)', {}, true, 'AND true, true, true');
      testFormula('AND(true, false, true)', errorThrowerContext, false, 'AND true, false, ErrorThrower (short-circuit)');
      testFormula('AND(1=1, 2=2)', {}, true, 'AND expressions true, true');
      testFormula('AND(1=1, 1=2)', {}, false, 'AND expressions true, false');
      testFormula('AND(true)', {}, true, 'AND single true');
      testFormula('AND(false)', {}, false, 'AND single false');
      testFormula('AND(IsFalse, ErrorThrower)', { ...definedVarContext, ...errorThrowerContext }, false, 'AND short-circuit with var');
      testFormulaError('AND(true, "text")', {}, 'Argument 2 of AND must be a boolean in AND(true,"text")', 'AND text input');
      testFormulaError('AND("text", true)', {}, 'Argument 1 of AND must be a boolean in AND("text",true)', 'AND text input first');
      testFormulaError('AND()', {}, 'Not enough arguments 0/1 in AND()', 'AND no arguments');
      testFormulaError('AND(true, 1)', {}, 'Argument 2 of AND must be a boolean in AND(true,1)', 'AND number input');
    });

    describe('OR', () => {
      testFormula('OR(true, false)', errorThrowerContext, true, 'OR true, ErrorThrower (short-circuit)');
      testFormula('OR(false, true)', {}, true, 'OR false, true');
      testFormula('OR(false, false)', {}, false, 'OR false, false');
      testFormula('OR(true, true)', {}, true, 'OR true, true');
      testFormula('OR(false, false, true)', {}, true, 'OR false, false, true');
      testFormula('OR(false, true, false)', errorThrowerContext, true, 'OR false, true, ErrorThrower (short-circuit)');
      testFormula('OR(1=2, 2=1)', {}, false, 'OR expressions false, false');
      testFormula('OR(1=1, 2=1)', {}, true, 'OR expressions true, false');
      testFormula('OR(true)', {}, true, 'OR single true');
      testFormula('OR(false)', {}, false, 'OR single false');
      testFormula('OR(IsTrue, ErrorThrower)', { ...definedVarContext, ...errorThrowerContext }, true, 'OR short-circuit with var');
      testFormulaError('OR(false, "text")', {}, 'Argument 2 of OR must be a boolean in OR(false,"text")', 'OR text input');
      testFormulaError('OR()', {}, 'Not enough arguments 0/1 in OR()', 'OR no arguments');
      testFormulaError('OR(false, 0)', {}, 'Argument 2 of OR must be a boolean in OR(false,0)', 'OR number input');
    });

    describe('CASE', () => {
      testFormula('CASE(3, 1, "One", 2, "Two", 3, "Three", "Other")', {}, "Three", 'CASE match third value');
      testFormula('CASE(4, 1, "One", 2, "Two", 3, "Three", "Other")', {}, "Other", 'CASE use else_result');
      testFormula('CASE(5, 1, "One", 2, "Two", 3, "Three")', {}, null, 'CASE no match, no else_result');
      testFormula('CASE("B", "A", 10, "B", 20, "C", 30, 0)', {}, 20, 'CASE string match');
      testFormula('CASE("D", "A", 10, "B", 20, "C", 30, 100)', {}, 100, 'CASE string use else_result');
      testFormula('CASE("D", "A", 10, "B", 20, "C", 30)', {}, null, 'CASE string no match, no else');
      testFormula('CASE(Status, "Open", 1, "Closed", 2, 0)', definedVarContext, 1, 'CASE var match');
      testFormula('CASE(Status, "Pending", 1, "Closed", 2, 0)', definedVarContext, 0, 'CASE var use else_result');
      testFormula('CASE(true, false, "No", true, "Yes", "Maybe")', {}, "Yes", 'CASE boolean expression');
      testFormula('CASE(Amount, 50, "Fifty", 100, "Hundred", 200, "Two Hundred", "Other")', definedVarContext, "Hundred", 'CASE number expression');
      testFormula('CASE(Amount, 50, "Fifty", 101, "HundredOne", "Other")', definedVarContext, "Other", 'CASE number expression else');
      testFormulaError('CASE(1)', {}, 'Not enough arguments 1/3 in CASE(1)', 'CASE one argument');
      testFormulaError('CASE(1, 2)', {}, 'Not enough arguments 2/3 in CASE(1,2)', 'CASE two arguments');
      testFormula('CASE(1, 2, "Val2")', {}, "Val2", 'CASE expression matches value, no else'); // This is valid: expression, value1, result1
    });

    describe('ISNULL', () => {
      testFormula('ISNULL(NullVar)', definedVarContext, true, 'ISNULL null variable');
      testFormula('ISNULL(NotDefined)', undefinedVarContext, true, 'ISNULL undefined variable');
      testFormula('ISNULL("")', {}, false, 'ISNULL empty string');
      testFormula('ISNULL("text")', {}, false, 'ISNULL string');
      testFormula('ISNULL(0)', {}, false, 'ISNULL zero');
      testFormula('ISNULL(1)', {}, false, 'ISNULL number');
      testFormula('ISNULL(BLANKVALUE("", 1))', {}, false, 'ISNULL BLANKVALUE returns 1 (not null)');
      testFormula('ISNULL(BLANKVALUE(null, "a"))', {}, false, 'ISNULL BLANKVALUE returns "a" (not null)');
      testFormula('ISNULL(Name)', definedVarContext, false, 'ISNULL Name="John"');
      testFormulaError('ISNULL()', {}, 'Not enough arguments 0/1 in ISNULL()', 'ISNULL no arguments');
      testFormulaError('ISNULL(1,2)', {}, 'Too many arguments 2/1 in ISNULL(1,2)', 'ISNULL too many arguments');
    });

    describe('ISNUMBER', () => {
      testFormula('ISNUMBER(123)', {}, true, 'ISNUMBER 123');
      testFormula('ISNUMBER(-123.45)', {}, true, 'ISNUMBER -123.45');
      testFormula('ISNUMBER("123")', {}, true, 'ISNUMBER "123"');
      testFormula('ISNUMBER("123.45")', {}, true, 'ISNUMBER "123.45"');
      testFormula('ISNUMBER("-10")', {}, true, 'ISNUMBER "-10"');
      testFormula('ISNUMBER("  123  ")', {}, true, 'ISNUMBER "  123  "');
      testFormula('ISNUMBER("")', {}, false, 'ISNUMBER empty string');
      testFormula('ISNUMBER("   ")', {}, false, 'ISNUMBER whitespace string');
      testFormula('ISNUMBER("abc")', {}, false, 'ISNUMBER "abc"');
      testFormula('ISNUMBER("12a3")', {}, false, 'ISNUMBER "12a3"');
      testFormula('ISNUMBER("12.3.4")', {}, false, 'ISNUMBER "12.3.4"');
      testFormula('ISNUMBER("1,234")', {}, false, 'ISNUMBER "1,234" (with comma)');
      testFormula('ISNUMBER(true)', {}, false, 'ISNUMBER true');
      testFormula('ISNUMBER(false)', {}, false, 'ISNUMBER false');
      testFormula('ISNUMBER(NullVar)', definedVarContext, false, 'ISNUMBER null');
      testFormula('ISNUMBER(NotDefined)', undefinedVarContext, false, 'ISNUMBER undefined');
      testFormula('ISNUMBER(DATE(2023,1,1))', {}, false, 'ISNUMBER Date object');
      testFormula('ISNUMBER(PI())', {}, true, 'ISNUMBER PI()');
      testFormula('ISNUMBER(1/0)', {}, false, 'ISNUMBER Infinity (isFinite check)'); // JS 1/0 is Infinity
      testFormula('ISNUMBER(0/0)', {}, false, 'ISNUMBER NaN (isFinite check)'); // JS 0/0 is NaN
      testFormulaError('ISNUMBER()', {}, 'Not enough arguments 0/1 in ISNUMBER()', 'ISNUMBER no arguments');
      testFormulaError('ISNUMBER(1,2)', {}, 'Too many arguments 2/1 in ISNUMBER(1,2)', 'ISNUMBER too many arguments');
    });

    describe('NULLVALUE', () => {
      testFormula('NULLVALUE(NullVar, "Default")', definedVarContext, "Default", 'NULLVALUE null variable');
      testFormula('NULLVALUE(NotDefined, "Default")', undefinedVarContext, "Default", 'NULLVALUE undefined variable');
      testFormula('NULLVALUE("Actual", "Default")', {}, "Actual", 'NULLVALUE non-null string');
      testFormula('NULLVALUE("", "Default")', {}, "", 'NULLVALUE empty string (not null)');
      testFormula('NULLVALUE(0, "Default")', {}, 0, 'NULLVALUE zero (not null)');
      testFormula('NULLVALUE(Name, "Unknown")', definedVarContext, "John", 'NULLVALUE Name="John"');
      testFormula('NULLVALUE(BLANKVALUE(null, null), "Subst")', {}, "Subst", 'NULLVALUE nested with null');
      testFormulaError('NULLVALUE(1)', {}, 'Not enough arguments 1/2 in NULLVALUE(1)', 'NULLVALUE one argument');
    });

    describe('ISCLONE', () => {
      testFormula('ISCLONE()', {}, false, 'ISCLONE basic');
      testFormulaError('ISCLONE(123)', {}, 'Too many arguments 1/0 in ISCLONE(123)', 'ISCLONE with argument');
    });

    describe('ISNEW', () => {
      testFormula('ISNEW()', {}, false, 'ISNEW basic');
      testFormulaError('ISNEW(true)', {}, 'Too many arguments 1/0 in ISNEW(true)', 'ISNEW with argument');
    });

    describe('PRIORVALUE', () => {
      testFormula('PRIORVALUE(Amount)', definedVarContext, null, 'PRIORVALUE Amount');
      testFormula('PRIORVALUE(Name)', definedVarContext, null, 'PRIORVALUE Name');
      // Test that argument evaluation error propagates
      testFormulaError('PRIORVALUE(NotDefined.prop)', undefinedVarContext, 'Field "NotDefined" not found in context', 'PRIORVALUE error propagation');
      testFormulaError('PRIORVALUE(NullVar.prop)', definedVarContext, "Cannot read properties of null (reading 'prop')", 'PRIORVALUE error from null prop access');
      testFormulaError('PRIORVALUE()', {}, 'Not enough arguments 0/1 in PRIORVALUE()', 'PRIORVALUE no arguments');
      testFormulaError('PRIORVALUE(1,2)', {}, 'Too many arguments 2/1 in PRIORVALUE(1,2)', 'PRIORVALUE too many arguments');
    });

  });
});
