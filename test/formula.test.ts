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

  describe('NULLVALUE', () => {
    testFormula('NULLVALUE(NullVar, "Default")', {NullVar: null}, "Default", 'NULLVALUE null variable');
    testFormula('NULLVALUE(NotDefined, "Default")', {}, "Default", 'NULLVALUE undefined variable');
    testFormula('NULLVALUE("Actual", "Default")', {}, "Actual", 'NULLVALUE non-null string');
    testFormula('NULLVALUE("", "Default")', {}, "", 'NULLVALUE empty string (not null)');
    testFormula('NULLVALUE(0, "Default")', {}, 0, 'NULLVALUE zero (not null)');
    testFormula('NULLVALUE(Name, "Unknown")', {Name: 'John'}, "John", 'NULLVALUE Name="John"');
    testFormula('NULLVALUE(BLANKVALUE(null, null), "Subst")', {}, "Subst", 'NULLVALUE nested with null');
    testFormulaError('NULLVALUE(1)', {}, 'Not enough arguments 1/2 in NULLVALUE(1)', 'NULLVALUE one argument');
    testFormulaError('NULLVALUE()', {}, 'Not enough arguments 0/2 in NULLVALUE()', 'NULLVALUE one argument');
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
    testFormula('ISNUMBER(NullVar)', {NullVar: null}, false, 'ISNUMBER null');
    testFormula('ISNUMBER(NotDefined)', {}, false, 'ISNUMBER undefined');
    testFormula('ISNUMBER(PI())', {}, true, 'ISNUMBER PI()');
    testFormula('ISNUMBER(1/0)', {}, false, 'ISNUMBER Infinity (isFinite check)'); // JS 1/0 is Infinity
    testFormula('ISNUMBER(0/0)', {}, false, 'ISNUMBER NaN (isFinite check)'); // JS 0/0 is NaN
    testFormulaError('ISNUMBER()', {}, 'Not enough arguments 0/1 in ISNUMBER()', 'ISNUMBER no arguments');
    testFormulaError('ISNUMBER(1,2)', {}, 'Too many arguments 2/1 in ISNUMBER(1,2)', 'ISNUMBER too many arguments');
    // testFormula('ISNUMBER(DATE(2023,1,1))', {}, false, 'ISNUMBER Date object');
  });
});
