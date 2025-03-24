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
    /*testFormula('CASE(Status, "New", 1, "In Progress", 2, "Completed", 3, 0)',
      { Status: "In Progress" }, 
      2, 
      'case statement');*/
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
