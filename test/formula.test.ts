import { assert } from 'console';
import { Context, formulaEval } from '../src/formula';

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
  });//*/

  // Text Operations
  describe('Variables', () => {
    testFormula('FirstName', { FirstName: "John" }, 'John', 'text field reference');
    testFormula('FirstName.value', { FirstName: { value: "John" } }, 'John', 'object field reference');
    testFormula('a.b.c', { a: { b: { c: "Super" } } }, 'Super', 'object field reference');
    testFormula('FirstName & " " & LastName',
      { FirstName: "John", LastName: "Doe" }, 
      'John Doe', 
      'text concatenation');
  });//*/

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
    testFormula('ISBLANK()', {}, true, 'IS BLANK with no argument return true');
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
    testFormula('IF(LENGTH(name) < 3, "Missing " + TEXT(3 - LENGTH(name)) + " Chars" , true)',
      { name: "J" },
      "Missing 2 Chars",
      'simple if condition');
    testFormula('IF(LENGTH(name) < 3, "Missing " + TEXT(3 - LENGTH(name)) + " Chars" , true)',
      { name: "Jo" },
      "Missing 1 Chars",
      'simple if condition');
    testFormula('IF(LENGTH(name) < 3, "Missing " + TEXT(3 - LENGTH(name)) + " Chars" , true)',
      { name: "John" },
      true,
      'simple if condition');
    testFormula('IF(LENGTH(name.value) < 3, "Missing " + TEXT(3 - LENGTH(name.value)) + " chars" , "")',
      (variables: string[])=> {
        if(variables.join('.') !== "name.value") throw new Error("Oups trying to evaluate another variable than name.value");
        return 'Jo'
      },
      "Missing 1 chars",
      'simple if condition');
    testFormula('IF(LENGTH(name.value) < 3, "Missing " + TEXT(3 - LENGTH(name.value)) + " chars" , "")',
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
    testFormula('LENGTH("Hello")', {}, 5, 'LENGTH function');
    testFormula('LENGTH("")', {}, 0, 'LENGTH function');
    testFormulaError('LENGTH(123)', {}, 'LENGTH function argument is not a string: LENGTH(123)', 'LENGTH function');

    testFormula('FLOOR(5.7)', {}, 5, 'FLOOR function with positive number');
    testFormula('FLOOR(5.2)', {}, 5, 'FLOOR function with positive number');
    testFormula('FLOOR(-5.7)', {}, -6, 'FLOOR function with negative number');
    testFormula('FLOOR(-5.2)', {}, -6, 'FLOOR function with negative number');
    testFormula('FLOOR(5)', {}, 5, 'FLOOR function with integer');
    testFormulaError('FLOOR("abc")', {}, 'FLOOR function argument is not a number: FLOOR("abc")', 'FLOOR function with non-number');

    testFormula('CEILING(5.7)', {}, 6, 'CEILING function with positive number');
    testFormula('CEILING(5.2)', {}, 6, 'CEILING function with positive number');
    testFormula('CEILING(-5.7)', {}, -5, 'CEILING function with negative number');
    testFormula('CEILING(-5.2)', {}, -5, 'CEILING function with negative number');
    testFormula('CEILING(5)', {}, 5, 'CEILING function with integer');
    testFormulaError('CEILING("abc")', {}, 'CEILING function argument is not a number: CEILING("abc")', 'CEILING function with non-number');
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
});
