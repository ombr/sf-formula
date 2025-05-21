export function validateArgs(args: Array<()=> unknown>, validations: {min?: number, max?: number}) {
  const { min, max } = validations;
  if(min && args.length < min) throw new Error(`Not enough arguments ${args.length}/${min}`);
  if(max && args.length > max) throw new Error(`Too many arguments ${args.length}/${max}`);
  return args;
}

const isBlank = (value: unknown) => {
  return value === undefined || value === null || value === "" || (typeof value === 'string' && value.trim() === "");
}

// Helper function to parse date expressions
function parseDateExpression(value: unknown): Date | null {
  if (value instanceof Date) {
    // Check for invalid Date objects, e.g. new Date('invalid string')
    return isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'string') {
    // ISO 8601 Date (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      // Check if date components are valid before creating Date to avoid month wrapping by Date constructor
      if (month < 1 || month > 12 || day < 1 || day > 31) return null;
      // Simple check for day validity based on month (doesn't cover all leap year specifics perfectly but good enough for initial parse)
      if (month === 2 && day > 29) return null;
      if ([4,6,9,11].includes(month) && day > 30) return null;

      const date = new Date(Date.UTC(year, month - 1, day));
      return isNaN(date.getTime()) ? null : date;
    }
    // ISO 8601 Datetime (YYYY-MM-DDTHH:mm:ss.sssZ or with offset)
    // More robust regex for ISO 8601 including optional time, ms, and Z or offset
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|([+-]\d{2}:\d{2}))?$/.test(value)) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    // General Date parsing (less reliable, but as a fallback)
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === 'number') {
    // Assume Unix timestamp in seconds
    const date = new Date(value * 1000);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}

export const defaultFunctions: Record<string, (...args: Array<()=> unknown>) => unknown> = {
  'ADDMONTHS': (...args: Array<() => unknown>) => {
    const [dateExprArg, numMonthsArg] = validateArgs(args, {min: 2, max: 2});
    const dateVal = dateExprArg();
    const num_months = numMonthsArg();

    if (typeof num_months !== 'number' || !Number.isInteger(num_months)) {
      throw new Error('Argument 2 of ADDMONTHS must be an integer');
    }

    const originalDate = parseDateExpression(dateVal);
    if (!originalDate) return null;

    // Work with UTC dates
    const year = originalDate.getUTCFullYear();
    const month = originalDate.getUTCMonth(); // 0-indexed
    const day = originalDate.getUTCDate();
    const time = originalDate.getUTCHours() * 3600000 + originalDate.getUTCMinutes() * 60000 + originalDate.getUTCSeconds() * 1000 + originalDate.getUTCMilliseconds();


    // Check if the original date was the last day of its month
    const originalDateIsLastDayOfMonth = day === new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    const targetMonth = month + num_months;
    let targetYear = year + Math.floor(targetMonth / 12);
    const finalMonth = targetMonth % 12; // This might be negative, adjust below

    let newDate;
    if (originalDateIsLastDayOfMonth) {
      // Set to the last day of the target month
      newDate = new Date(Date.UTC(targetYear, finalMonth + 1, 0)); // Day 0 of next month is last day of current
    } else {
      // Set to the original day, clamping if it exceeds the number of days in the target month
      const daysInTargetMonth = new Date(Date.UTC(targetYear, finalMonth + 1, 0)).getUTCDate();
      newDate = new Date(Date.UTC(targetYear, finalMonth, Math.min(day, daysInTargetMonth)));
    }
    
    // Restore original time components
    newDate.setTime(newDate.getTime() + time);
    return newDate;
  },
  'DATE': (...args: Array<() => unknown>) => {
    const [yearArg, monthArg, dayArg] = validateArgs(args, {min: 3, max: 3});
    const year = yearArg();
    const month = monthArg();
    const day = dayArg();

    if (typeof year !== 'number' || !Number.isInteger(year)) throw new Error('Argument 1 of DATE must be an integer number');
    if (typeof month !== 'number' || !Number.isInteger(month)) throw new Error('Argument 2 of DATE must be an integer number');
    if (typeof day !== 'number' || !Number.isInteger(day)) throw new Error('Argument 3 of DATE must be an integer number');

    // Salesforce month is 1-12. JS Date month is 0-11.
    // Basic validation for month and day ranges to avoid unexpected Date constructor behavior (like month wrapping)
    if (month < 1 || month > 12) throw new Error('Argument 2 of DATE (month) must be between 1 and 12');
    if (day < 1 || day > 31) throw new Error('Argument 3 of DATE (day) must be between 1 and 31'); // Simplified check

    const resultDate = new Date(Date.UTC(year, month - 1, day));
    // Verify the date wasn't invalid or wrapped due to components like day=31 in a 30-day month
    if (resultDate.getUTCFullYear() !== year || resultDate.getUTCMonth() !== month - 1 || resultDate.getUTCDate() !== day) {
        // This indicates an invalid date like DATE(2023,2,30) which JS would roll over.
        // Depending on desired strictness, could return null or throw error.
        // Salesforce typically errors on invalid date components.
        throw new Error('Invalid date components for DATE function');
    }
    return resultDate;
  },
  'DATEVALUE': (...args: Array<() => unknown>) => {
    const [dateExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateVal = dateExprArg();
    
    const parsedDate = parseDateExpression(dateVal);
    if (!parsedDate) return null;

    // Return a new Date object representing only the date part (time set to midnight UTC)
    return new Date(Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate()));
  },
  'DATETIMEVALUE': (...args: Array<() => unknown>) => {
    const [dateTimeExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateTimeVal = dateTimeExprArg();
    
    // parseDateExpression already handles Date objects, strings (ISO and general), and numbers (timestamps).
    return parseDateExpression(dateTimeVal);
  },
  'DAY': (...args: Array<() => unknown>) => {
    const [dateExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateVal = dateExprArg();
    
    const parsedDate = parseDateExpression(dateVal);
    if (!parsedDate) return null; // Or throw new Error('Argument 1 of DAY must be a valid date expression');
    
    return parsedDate.getUTCDate();
  },
  'DAYOFYEAR': (...args: Array<() => unknown>) => {
    const [dateExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateVal = dateExprArg();

    const parsedDate = parseDateExpression(dateVal);
    if (!parsedDate) return null;

    const startOfYear = new Date(Date.UTC(parsedDate.getUTCFullYear(), 0, 1));
    const diffMilliseconds = parsedDate.getTime() - startOfYear.getTime();
    const oneDayMilliseconds = 24 * 60 * 60 * 1000;
    return Math.floor(diffMilliseconds / oneDayMilliseconds) + 1;
  },
  'HOUR': (...args: Array<() => unknown>) => {
    const [dateTimeExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateTimeVal = dateTimeExprArg();

    const parsedDate = parseDateExpression(dateTimeVal);
    if (!parsedDate) return null;

    return parsedDate.getHours(); // Local time hour
  },
  'ISOWEEK': (...args: Array<() => unknown>) => {
    const [dateExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateVal = dateExprArg();

    const parsedDate = parseDateExpression(dateVal);
    if (!parsedDate) return null;
    
    // Create a new date object to avoid modifying the original
    const targetDate = new Date(parsedDate.valueOf());
    
    // Set to UTC to ensure consistency
    const d = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate()));
    
    // Move to the Thursday of the week (day 4 of ISO week, Monday is 1, Sunday is 7)
    // getUTCDay() is 0 for Sunday, 1 for Monday, ..., 6 for Saturday
    // (d.getUTCDay() || 7) makes Sunday 7, consistent with ISO week where Monday is 1
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    
    // Get the start of the year containing this Thursday
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    
    // Calculate the week number
    const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNumber;
  },
  'ISOYEAR': (...args: Array<() => unknown>) => {
    const [dateExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateVal = dateExprArg();

    const parsedDate = parseDateExpression(dateVal);
    if (!parsedDate) return null;

    const targetDate = new Date(parsedDate.valueOf());
    const d = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate()));
    
    // Adjust to Thursday of the same week
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    
    return d.getUTCFullYear();
  },
  'MILLISECOND': (...args: Array<() => unknown>) => {
    const [dateTimeExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateTimeVal = dateTimeExprArg();

    const parsedDate = parseDateExpression(dateTimeVal);
    if (!parsedDate) return null;

    return parsedDate.getMilliseconds(); // Local time milliseconds
  },
  'MINUTE': (...args: Array<() => unknown>) => {
    const [dateTimeExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateTimeVal = dateTimeExprArg();

    const parsedDate = parseDateExpression(dateTimeVal);
    if (!parsedDate) return null;

    return parsedDate.getMinutes(); // Local time minutes
  },
  'MINUTE': (...args: Array<() => unknown>) => {
    const [dateTimeExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateTimeVal = dateTimeExprArg();

    const parsedDate = parseDateExpression(dateTimeVal);
    if (!parsedDate) return null;

    return parsedDate.getMinutes(); // Local time minutes
  },
  'MONTH': (...args: Array<() => unknown>) => {
    const [dateExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateVal = dateExprArg();

    const parsedDate = parseDateExpression(dateVal);
    if (!parsedDate) return null;

    return parsedDate.getUTCMonth() + 1; // UTC month, 1-indexed
  },
  'MONTH': (...args: Array<() => unknown>) => {
    const [dateExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateVal = dateExprArg();

    const parsedDate = parseDateExpression(dateVal);
    if (!parsedDate) return null;

    return parsedDate.getUTCMonth() + 1; // UTC month, 1-indexed
  },
  'NOW': (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 0, max: 0});
    return new Date(); // Current moment
  },
  'NOW': (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 0, max: 0});
    return new Date(); // Current moment
  },
  'SECOND': (...args: Array<() => unknown>) => {
    const [dateTimeExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateTimeVal = dateTimeExprArg();

    const parsedDate = parseDateExpression(dateTimeVal);
    if (!parsedDate) return null;

    return parsedDate.getSeconds(); // Local time seconds
  },
  'SECOND': (...args: Array<() => unknown>) => {
    const [dateTimeExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateTimeVal = dateTimeExprArg();

    const parsedDate = parseDateExpression(dateTimeVal);
    if (!parsedDate) return null;

    return parsedDate.getSeconds(); // Local time seconds
  },
  'TIMENOW': (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 0, max: 0});
    const now = new Date();
    // Create a new Date object that represents the current time in GMT.
    // Note: JavaScript Date objects are inherently UTC based but getHours etc. are local by default.
    // To represent "time in GMT", we'd typically format a string or ensure all components are UTC.
    // For returning a Date object that is "time in GMT", we can set a fixed date (like epoch) and use UTC time parts.
    // However, the request implies current time, just "in GMT".
    // A simple new Date() is current moment. If it needs to be *just* time, that's different.
    // "Salesforce seems to store this as time type. Let's return a Date object for now, but it represents current GMT time."
    // This implies the Date object itself should be the current moment, and any display interpretation should handle GMT.
    // So, new Date() is appropriate, as its underlying value is UTC.
    return new Date(); 
  },
  'SECOND': (...args: Array<() => unknown>) => {
    const [dateTimeExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateTimeVal = dateTimeExprArg();

    const parsedDate = parseDateExpression(dateTimeVal);
    if (!parsedDate) return null;

    return parsedDate.getSeconds(); // Local time seconds
  },
  'TIMENOW': (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 0, max: 0});
    // Per spec: "Let's return a Date object for now, but it represents current GMT time."
    // A JS Date object's internal value is always UTC (epoch milliseconds).
    // So, new Date() correctly represents the current moment in a way that can be interpreted as GMT/UTC.
    return new Date(); 
  },
  'TIMEVALUE': (...args: Array<() => unknown>) => {
    const [exprArg] = validateArgs(args, {min: 1, max: 1});
    const expr = exprArg();

    if (expr instanceof Date) {
      if (isNaN(expr.getTime())) return null; // Invalid Date object
      return new Date(Date.UTC(1970, 0, 1, expr.getUTCHours(), expr.getUTCMinutes(), expr.getUTCSeconds(), expr.getUTCMilliseconds()));
    }

    if (typeof expr === 'string') {
      // Try parsing as HH:MM:SS.sss
      const timeRegex = /^(\d{2}):(\d{2}):(\d{2})(\.(\d{1,3}))?$/;
      const match = expr.match(timeRegex);
      if (match) {
        const H = parseInt(match[1], 10);
        const M = parseInt(match[2], 10);
        const S = parseInt(match[3], 10);
        const sss = match[5] ? parseInt(match[5].padEnd(3, '0'), 10) : 0; // padEnd for "1" -> "100"

        if (H >= 0 && H <= 23 && M >= 0 && M <= 59 && S >= 0 && S <= 59 && sss >= 0 && sss <= 999) {
          return new Date(Date.UTC(1970, 0, 1, H, M, S, sss));
        }
      }
      // Fallback to parseDateExpression for full datetime strings
      const parsedDate = parseDateExpression(expr);
      if (parsedDate) {
        return new Date(Date.UTC(1970, 0, 1, parsedDate.getUTCHours(), parsedDate.getUTCMinutes(), parsedDate.getUTCSeconds(), parsedDate.getUTCMilliseconds()));
      }
    }
    
    // If it's a number, it might be a timestamp, extract time parts.
    if (typeof expr === 'number') {
        const parsedDate = parseDateExpression(expr); // Converts number (seconds) to Date
        if (parsedDate) {
             return new Date(Date.UTC(1970, 0, 1, parsedDate.getUTCHours(), parsedDate.getUTCMinutes(), parsedDate.getUTCSeconds(), parsedDate.getUTCMilliseconds()));
        }
    }

    return null; // Or throw new Error('Invalid expression for TIMEVALUE');
  },
  'TODAY': (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 0, max: 0});
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  },
  'UNIXTIMESTAMP': (...args: Array<() => unknown>) => {
    const [dateExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateVal = dateExprArg();

    const parsedDate = parseDateExpression(dateVal);
    if (!parsedDate) return null;

    return Math.floor(parsedDate.getTime() / 1000);
  },
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
  },
  'ABS': (...args: Array<() => unknown>) => {
    const value = validateArgs(args, {min: 1, max: 1})[0]();
    if(typeof value !== 'number') throw new Error('Argument 1 of ABS must be a number');
    return Math.abs(value);
  },
  'ACOS': (...args: Array<() => unknown>) => {
    const value = validateArgs(args, {min: 1, max: 1})[0]();
    if(typeof value !== 'number') throw new Error('Argument 1 of ACOS must be a number');
    if (value < -1 || value > 1) return null;
    return Math.acos(value);
  },
  'ASIN': (...args: Array<() => unknown>) => {
    const value = validateArgs(args, {min: 1, max: 1})[0]();
    if(typeof value !== 'number') throw new Error('Argument 1 of ASIN must be a number');
    if (value < -1 || value > 1) return null;
    return Math.asin(value);
  },
  'ATAN': (...args: Array<() => unknown>) => {
    const value = validateArgs(args, {min: 1, max: 1})[0]();
    if(typeof value !== 'number') throw new Error('Argument 1 of ATAN must be a number');
    return Math.atan(value);
  },
  'ATAN2': (...args: Array<() => unknown>) => {
    const [yArg, xArg] = validateArgs(args, {min: 2, max: 2});
    const y = yArg();
    const x = xArg();
    if(typeof y !== 'number') throw new Error('Argument 1 of ATAN2 must be a number');
    if(typeof x !== 'number') throw new Error('Argument 2 of ATAN2 must be a number');
    return Math.atan2(y, x);
  },
  'COS': (...args: Array<() => unknown>) => {
    const value = validateArgs(args, {min: 1, max: 1})[0]();
    if(typeof value !== 'number') throw new Error('Argument 1 of COS must be a number');
    return Math.cos(value);
  },
  'EXP': (...args: Array<() => unknown>) => {
    const value = validateArgs(args, {min: 1, max: 1})[0]();
    if(typeof value !== 'number') throw new Error('Argument 1 of EXP must be a number');
    return Math.exp(value);
  },
  'LN': (...args: Array<() => unknown>) => {
    const value = validateArgs(args, {min: 1, max: 1})[0]();
    if(typeof value !== 'number') throw new Error('Argument 1 of LN must be a number');
    if (value <= 0) throw new Error('Argument 1 of LN must be a positive number');
    return Math.log(value);
  },
  'LOG': (...args: Array<() => unknown>) => {
    const value = validateArgs(args, {min: 1, max: 1})[0]();
    if(typeof value !== 'number') throw new Error('Argument 1 of LOG must be a number');
    if (value <= 0) throw new Error('Argument 1 of LOG must be a positive number');
    return Math.log10(value);
  },
  'MAX': (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 1});
    const values = args.map((arg, i) => {
      const value = arg();
      if(typeof value !== 'number') throw new Error(`Argument ${i+1} of MAX must be a number`);
      return value;
    });
    return Math.max(...values);
  },
  'MCEILING': (...args: Array<() => unknown>) => {
    const value = validateArgs(args, {min: 1, max: 1})[0]();
    if(typeof value !== 'number') throw new Error('Argument 1 of MCEILING must be a number')
    return Math.ceil(value);
  },
  'MFLOOR': (...args: Array<() => unknown>) => {
    const value = validateArgs(args, {min: 1, max: 1})[0]();
    if(typeof value !== 'number') throw new Error('Argument 1 of MFLOOR must be a number')
    return Math.floor(value);
  },
  'MIN': (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 1});
    const values = args.map((arg, i) => {
      const value = arg();
      if(typeof value !== 'number') throw new Error(`Argument ${i+1} of MIN must be a number`);
      return value;
    });
    return Math.min(...values);
  },
  'MOD': (...args: Array<() => unknown>) => {
    const [numberArg, divisorArg] = validateArgs(args, {min: 2, max: 2});
    const number = numberArg();
    const divisor = divisorArg();
    if(typeof number !== 'number') throw new Error('Argument 1 of MOD must be a number');
    if(typeof divisor !== 'number') throw new Error('Argument 2 of MOD must be a number');
    if (divisor === 0) throw new Error('Argument 2 of MOD cannot be zero');
    return number % divisor;
  },
  'PI': (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 0, max: 0});
    return Math.PI;
  },
  'ROUND': (...args: Array<() => unknown>) => {
    const [numberArg, numDigitsArg] = validateArgs(args, {min: 2, max: 2});
    const number = numberArg();
    const num_digits = numDigitsArg();
    if(typeof number !== 'number') throw new Error('Argument 1 of ROUND must be a number');
    if(typeof num_digits !== 'number') throw new Error('Argument 2 of ROUND must be a number');
    if(!Number.isInteger(num_digits)) throw new Error('Argument 2 of ROUND must be an integer');
    const factor = Math.pow(10, num_digits);
    return Math.round(number * factor) / factor;
  },
  'SIN': (...args: Array<() => unknown>) => {
    const value = validateArgs(args, {min: 1, max: 1})[0]();
    if(typeof value !== 'number') throw new Error('Argument 1 of SIN must be a number');
    return Math.sin(value);
  },
  'SQRT': (...args: Array<() => unknown>) => {
    const value = validateArgs(args, {min: 1, max: 1})[0]();
    if(typeof value !== 'number') throw new Error('Argument 1 of SQRT must be a number');
    if (value < 0) throw new Error('Argument 1 of SQRT must be a non-negative number');
    return Math.sqrt(value);
  },
  'TAN': (...args: Array<() => unknown>) => {
    const value = validateArgs(args, {min: 1, max: 1})[0]();
    if(typeof value !== 'number') throw new Error('Argument 1 of TAN must be a number');
    return Math.tan(value);
  },
  'TRUNC': (...args: Array<() => unknown>) => {
    const [numberArg, numDigitsArg] = validateArgs(args, {min: 1, max: 2});
    const number = numberArg();
    if(typeof number !== 'number') throw new Error('Argument 1 of TRUNC must be a number');

    let num_digits = 0;
    if (numDigitsArg) {
      const numDigitsValue = numDigitsArg();
      if (typeof numDigitsValue !== 'number') throw new Error('Argument 2 of TRUNC must be a number');
      if (!Number.isInteger(numDigitsValue)) throw new Error('Argument 2 of TRUNC must be an integer');
      num_digits = numDigitsValue;
    }

    if (num_digits === 0) {
      return Math.trunc(number);
    } else if (num_digits > 0) {
      const factor = Math.pow(10, num_digits);
      return Math.trunc(number * factor) / factor;
    } else { // num_digits < 0
      const factor = Math.pow(10, Math.abs(num_digits));
      return Math.trunc(number / factor) * factor;
    }
  },
  'ASCII': (...args: Array<() => unknown>) => {
    const [textArg] = validateArgs(args, {min: 1, max: 1});
    const text = textArg();
    if (typeof text !== 'string') throw new Error('Argument 1 of ASCII must be a string');
    if (text.length === 0) return null;
    return text.charCodeAt(0);
  },
  'BEGINS': (...args: Array<() => unknown>) => {
    const [textArg, compareTextArg] = validateArgs(args, {min: 2, max: 2});
    const text = textArg();
    const compare_text = compareTextArg();
    if (typeof text !== 'string') throw new Error('Argument 1 of BEGINS must be a string');
    if (typeof compare_text !== 'string') throw new Error('Argument 2 of BEGINS must be a string');
    return text.startsWith(compare_text);
  },
  'BR': (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 0, max: 0});
    return '\n';
  },
  'CONTAINS': (...args: Array<() => unknown>) => {
    const [textArg, compareTextArg] = validateArgs(args, {min: 2, max: 2});
    const text = textArg();
    const compare_text = compareTextArg();
    if (typeof text !== 'string') throw new Error('Argument 1 of CONTAINS must be a string');
    if (typeof compare_text !== 'string') throw new Error('Argument 2 of CONTAINS must be a string');
    return text.includes(compare_text);
  },
  'FIND': (...args: Array<() => unknown>) => {
    const [searchTextArg, textArg, startNumArg] = validateArgs(args, {min: 2, max: 3});
    const search_text = searchTextArg();
    const text = textArg();

    if (typeof search_text !== 'string') throw new Error('Argument 1 of FIND must be a string');
    if (typeof text !== 'string') throw new Error('Argument 2 of FIND must be a string');

    let start_num = 1;
    if (startNumArg) {
      const startNumValue = startNumArg();
      if (typeof startNumValue !== 'number') throw new Error('Argument 3 of FIND must be a number');
      if (!Number.isInteger(startNumValue) || startNumValue < 1) throw new Error('Argument 3 of FIND must be a positive integer');
      start_num = startNumValue;
    }

    if (start_num > text.length) return 0;

    // Adjust for 0-based indexing for indexOf
    const result = text.indexOf(search_text, start_num - 1);
    
    // Adjust result to be 1-based; if not found, indexOf returns -1, so result + 1 will be 0
    return result + 1;
  },
  'HTMLENCODE': (...args: Array<() => unknown>) => {
    const [textArg] = validateArgs(args, {min: 1, max: 1});
    const text = textArg();
    if (typeof text !== 'string') throw new Error('Argument 1 of HTMLENCODE must be a string');
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },
  'HYPERLINK': (...args: Array<() => unknown>) => {
    const [urlArg, friendlyNameArg, targetArg] = validateArgs(args, {min: 2, max: 3});
    const url = urlArg();
    const friendly_name = friendlyNameArg();

    if (typeof url !== 'string') throw new Error('Argument 1 of HYPERLINK must be a string');
    if (typeof friendly_name !== 'string') throw new Error('Argument 2 of HYPERLINK must be a string');

    let target_attr = '';
    if (targetArg) {
      const target = targetArg();
      if (typeof target !== 'string') throw new Error('Argument 3 of HYPERLINK must be a string');
      target_attr = ` target="${target}"`;
    }
    return `<a href="${url}"${target_attr}>${friendly_name}</a>`;
  },
  'IMAGE': (...args: Array<() => unknown>) => {
    const [imageUrlArg, alternateTextArg, heightArg, widthArg] = validateArgs(args, {min: 2, max: 4});
    const image_url = imageUrlArg();
    const alternate_text = alternateTextArg();

    if (typeof image_url !== 'string') throw new Error('Argument 1 of IMAGE must be a string');
    if (typeof alternate_text !== 'string') throw new Error('Argument 2 of IMAGE must be a string');

    let height_attr = '';
    if (heightArg) {
      const height = heightArg();
      if (typeof height !== 'number') throw new Error('Argument 3 of IMAGE must be a number');
      height_attr = ` height="${height}"`;
    }

    let width_attr = '';
    if (widthArg) {
      const width = widthArg();
      if (typeof width !== 'number') throw new Error('Argument 4 of IMAGE must be a number');
      width_attr = ` width="${width}"`;
    }
    return `<img src="${image_url}" alt="${alternate_text}"${height_attr}${width_attr}>`;
  },
  'INITCAP': (...args: Array<() => unknown>) => {
    const [textArg] = validateArgs(args, {min: 1, max: 1});
    const text = textArg();
    if (typeof text !== 'string') throw new Error('Argument 1 of INITCAP must be a string');
    if (text.length === 0) return "";
    return text.toLowerCase().replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
  },
  'JSENCODE': (...args: Array<() => unknown>) => {
    const [textArg] = validateArgs(args, {min: 1, max: 1});
    const text = textArg();
    if (typeof text !== 'string') throw new Error('Argument 1 of JSENCODE must be a string');
    return text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\//g, '\\/');
      // Note: More comprehensive escapes might be needed for full safety, 
      // such as for unicode characters or control characters.
      // For example, Salesforce also escapes <, >, &, but that might be context-dependent (e.g. in script tags).
      // Given the current spec, this is a direct interpretation.
  },
  'JSINHTMLENCODE': (...args: Array<() => unknown>) => {
    const [textArg] = validateArgs(args, {min: 1, max: 1});
    const text = textArg();
    if (typeof text !== 'string') throw new Error('Argument 1 of JSINHTMLENCODE must be a string');
    
    const htmlEncoded = defaultFunctions['HTMLENCODE'](() => text) as string;
    return defaultFunctions['JSENCODE'](() => htmlEncoded);
  },
  'LEFT': (...args: Array<() => unknown>) => {
    const [textArg, numCharsArg] = validateArgs(args, {min: 2, max: 2});
    const text = textArg();
    const num_chars = numCharsArg();

    if (typeof text !== 'string') throw new Error('Argument 1 of LEFT must be a string');
    if (typeof num_chars !== 'number') throw new Error('Argument 2 of LEFT must be a number');
    if (!Number.isInteger(num_chars) || num_chars < 0) throw new Error('Argument 2 of LEFT must be a non-negative integer');

    if (num_chars === 0) return "";
    return text.substring(0, num_chars);
  },
  'LOWER': (...args: Array<() => unknown>) => {
    const [textArg] = validateArgs(args, {min: 1, max: 1});
    const text = textArg();
    if (typeof text !== 'string') throw new Error('Argument 1 of LOWER must be a string');
    return text.toLowerCase();
  },
  'LPAD': (...args: Array<() => unknown>) => {
    const [textArg, paddedLengthArg, padStringArg] = validateArgs(args, {min: 2, max: 3});
    const text = textArg();
    const padded_length = paddedLengthArg();

    if (typeof text !== 'string') throw new Error('Argument 1 of LPAD must be a string');
    if (typeof padded_length !== 'number') throw new Error('Argument 2 of LPAD must be a number');
    if (!Number.isInteger(padded_length) || padded_length < 0) throw new Error('Argument 2 of LPAD must be a non-negative integer');

    let pad_string = " ";
    if (padStringArg) {
      const padStringValue = padStringArg();
      if (typeof padStringValue !== 'string') throw new Error('Argument 3 of LPAD must be a string');
      if (padStringValue.length === 0) {
        pad_string = " "; // Default to space if empty string is provided
      } else {
        pad_string = padStringValue;
      }
    }
    
    if (text.length >= padded_length) {
      return text.substring(0, padded_length);
    }

    return text.padStart(padded_length, pad_string);
  },
  'MID': (...args: Array<() => unknown>) => {
    const [textArg, startNumArg, numCharsArg] = validateArgs(args, {min: 3, max: 3});
    const text = textArg();
    const start_num_val = startNumArg();
    const num_chars = numCharsArg();

    if (typeof text !== 'string') throw new Error('Argument 1 of MID must be a string');
    if (typeof start_num_val !== 'number') throw new Error('Argument 2 of MID must be a number');
    if (typeof num_chars !== 'number') throw new Error('Argument 3 of MID must be a number');

    if (!Number.isInteger(start_num_val) || start_num_val < 1) throw new Error('Argument 2 of MID must be a positive integer');
    if (!Number.isInteger(num_chars) || num_chars < 0) throw new Error('Argument 3 of MID must be a non-negative integer');
    
    if (num_chars === 0) return "";
    // Adjust start_num to be 0-indexed for substr
    const start_index = Math.max(1, start_num_val) - 1;
    return text.substr(start_index, num_chars);
  },
  'REVERSE': (...args: Array<() => unknown>) => {
    const [textArg] = validateArgs(args, {min: 1, max: 1});
    const text = textArg();
    if (typeof text !== 'string') throw new Error('Argument 1 of REVERSE must be a string');
    return text.split('').reverse().join('');
  },
  'RIGHT': (...args: Array<() => unknown>) => {
    const [textArg, numCharsArg] = validateArgs(args, {min: 2, max: 2});
    const text = textArg();
    const num_chars = numCharsArg();

    if (typeof text !== 'string') throw new Error('Argument 1 of RIGHT must be a string');
    if (typeof num_chars !== 'number') throw new Error('Argument 2 of RIGHT must be a number');
    if (!Number.isInteger(num_chars) || num_chars < 0) throw new Error('Argument 2 of RIGHT must be a non-negative integer');

    if (num_chars === 0) return "";
    if (num_chars >= text.length) return text;
    return text.slice(-num_chars);
  },
  'RPAD': (...args: Array<() => unknown>) => {
    const [textArg, paddedLengthArg, padStringArg] = validateArgs(args, {min: 2, max: 3});
    const text = textArg();
    const padded_length = paddedLengthArg();

    if (typeof text !== 'string') throw new Error('Argument 1 of RPAD must be a string');
    if (typeof padded_length !== 'number') throw new Error('Argument 2 of RPAD must be a number');
    if (!Number.isInteger(padded_length) || padded_length < 0) throw new Error('Argument 2 of RPAD must be a non-negative integer');

    let pad_string = " ";
    if (padStringArg) {
      const padStringValue = padStringArg();
      if (typeof padStringValue !== 'string') throw new Error('Argument 3 of RPAD must be a string');
      if (padStringValue.length === 0) {
        pad_string = " "; // Default to space if empty string is provided
      } else {
        pad_string = padStringValue;
      }
    }
    
    if (text.length >= padded_length) {
      return text.substring(0, padded_length);
    }

    return text.padEnd(padded_length, pad_string);
  },
  'SUBSTITUTE': (...args: Array<() => unknown>) => {
    const [textArg, oldTextArg, newTextArg, occurrenceNumArg] = validateArgs(args, {min: 3, max: 4});
    const text = textArg();
    const old_text = oldTextArg();
    const new_text = newTextArg();

    if (typeof text !== 'string') throw new Error('Argument 1 of SUBSTITUTE must be a string');
    if (typeof old_text !== 'string') throw new Error('Argument 2 of SUBSTITUTE must be a string');
    if (typeof new_text !== 'string') throw new Error('Argument 3 of SUBSTITUTE must be a string');

    if (old_text === "") return text; // Replacing empty string would lead to infinite loop or unexpected behavior

    if (occurrenceNumArg) {
      const occurrence_num = occurrenceNumArg();
      if (typeof occurrence_num !== 'number') throw new Error('Argument 4 of SUBSTITUTE must be a number');
      if (!Number.isInteger(occurrence_num) || occurrence_num <= 0) {
        // Non-positive or non-integer occurrence_num means no substitution
        return text;
      }

      let count = 0;
      let pos = 0;
      let result = "";
      while(pos < text.length) {
        const foundAt = text.indexOf(old_text, pos);
        if (foundAt === -1) {
          result += text.substring(pos);
          break;
        }
        count++;
        result += text.substring(pos, foundAt);
        if (count === occurrence_num) {
          result += new_text;
        } else {
          result += old_text;
        }
        pos = foundAt + old_text.length;
      }
      return result;
    } else {
      // Global replace
      return text.split(old_text).join(new_text);
    }
  },
  'TRIM': (...args: Array<() => unknown>) => {
    const [textArg] = validateArgs(args, {min: 1, max: 1});
    const text = textArg();
    if (typeof text !== 'string') throw new Error('Argument 1 of TRIM must be a string');
    return text.trim();
  },
  'SECOND': (...args: Array<() => unknown>) => {
    const [dateTimeExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateTimeVal = dateTimeExprArg();

    const parsedDate = parseDateExpression(dateTimeVal);
    if (!parsedDate) return null;

    return parsedDate.getSeconds(); // Local time seconds
  },
  'TIMEVALUE': (...args: Array<() => unknown>) => {
    const [exprArg] = validateArgs(args, {min: 1, max: 1});
    const expr = exprArg();

    if (expr instanceof Date) {
      if (isNaN(expr.getTime())) return null; // Invalid Date object
      return new Date(Date.UTC(1970, 0, 1, expr.getUTCHours(), expr.getUTCMinutes(), expr.getUTCSeconds(), expr.getUTCMilliseconds()));
    }

    if (typeof expr === 'string') {
      // Try parsing as HH:MM:SS.sss
      const timeRegex = /^(\d{2}):(\d{2}):(\d{2})(\.(\d{1,3}))?$/;
      const match = expr.match(timeRegex);
      if (match) {
        const H = parseInt(match[1], 10);
        const M = parseInt(match[2], 10);
        const S = parseInt(match[3], 10);
        const sss = match[5] ? parseInt(match[5].padEnd(3, '0'), 10) : 0; // padEnd for "1" -> "100"

        if (H >= 0 && H <= 23 && M >= 0 && M <= 59 && S >= 0 && S <= 59 && sss >= 0 && sss <= 999) {
          return new Date(Date.UTC(1970, 0, 1, H, M, S, sss));
        }
      }
      // Fallback to parseDateExpression for full datetime strings
      const parsedDate = parseDateExpression(expr);
      if (parsedDate) {
        return new Date(Date.UTC(1970, 0, 1, parsedDate.getUTCHours(), parsedDate.getUTCMinutes(), parsedDate.getUTCSeconds(), parsedDate.getUTCMilliseconds()));
      }
    }
    
    // If it's a number, it might be a timestamp, extract time parts.
    if (typeof expr === 'number') {
        const parsedDate = parseDateExpression(expr); // Converts number (seconds) to Date
        if (parsedDate) {
             return new Date(Date.UTC(1970, 0, 1, parsedDate.getUTCHours(), parsedDate.getUTCMinutes(), parsedDate.getUTCSeconds(), parsedDate.getUTCMilliseconds()));
        }
    }

    return null; // Or throw new Error('Invalid expression for TIMEVALUE');
  },
  'TODAY': (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 0, max: 0});
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  },
  'UNIXTIMESTAMP': (...args: Array<() => unknown>) => {
    const [dateExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateVal = dateExprArg();

    const parsedDate = parseDateExpression(dateVal);
    if (!parsedDate) return null;

    return Math.floor(parsedDate.getTime() / 1000);
  },
  'WEEKDAY': (...args: Array<() => unknown>) => {
    const [dateExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateVal = dateExprArg();

    const parsedDate = parseDateExpression(dateVal);
    if (!parsedDate) return null;

    return parsedDate.getUTCDay() + 1; // 0 for Sunday, so +1
  },
  'YEAR': (...args: Array<() => unknown>) => {
    const [dateExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateVal = dateExprArg();

    const parsedDate = parseDateExpression(dateVal);
    if (!parsedDate) return null;

    return parsedDate.getUTCFullYear();
  },
  'FORMATDURATION': (...args: Array<() => unknown>) => {
    const [durationArg] = validateArgs(args, {min: 1, max: 1});
    const duration = durationArg();

    if (typeof duration !== 'number') {
      throw new Error('Argument 1 of FORMATDURATION must be a number (total seconds)');
    }
    if (duration < 0) {
        // Or handle negative durations if specified, e.g. return "-HH:MM:SS"
        // For now, let's assume non-negative.
        throw new Error('Argument 1 of FORMATDURATION must be a non-negative number');
    }

    const totalSeconds = Math.floor(duration);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const remainingSecondsAfterDays = totalSeconds % (24 * 3600);
    const hours = Math.floor(remainingSecondsAfterDays / 3600);
    const remainingSecondsAfterHours = remainingSecondsAfterDays % 3600;
    const minutes = Math.floor(remainingSecondsAfterHours / 60);
    const seconds = remainingSecondsAfterHours % 60;

    const hh = hours.toString().padStart(2, '0');
    const mm = minutes.toString().padStart(2, '0');
    const ss = seconds.toString().padStart(2, '0');

    if (days > 0) {
      return `${days}.${hh}:${mm}:${ss}`;
    }
    return `${hh}:${mm}:${ss}`;
  },
  'TODAY': (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 0, max: 0});
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  },
  'UNIXTIMESTAMP': (...args: Array<() => unknown>) => {
    const [dateExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateVal = dateExprArg();

    const parsedDate = parseDateExpression(dateVal);
    if (!parsedDate) return null;

    return Math.floor(parsedDate.getTime() / 1000);
  },
  'WEEKDAY': (...args: Array<() => unknown>) => {
    const [dateExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateVal = dateExprArg();

    const parsedDate = parseDateExpression(dateVal);
    if (!parsedDate) return null;

    return parsedDate.getUTCDay() + 1; // 0 for Sunday, so +1
  },
  'YEAR': (...args: Array<() => unknown>) => {
    const [dateExprArg] = validateArgs(args, {min: 1, max: 1});
    const dateVal = dateExprArg();

    const parsedDate = parseDateExpression(dateVal);
    if (!parsedDate) return null;

    return parsedDate.getUTCFullYear();
  },
  'FORMATDURATION': (...args: Array<() => unknown>) => {
    const [durationArg] = validateArgs(args, {min: 1, max: 1});
    const duration = durationArg();

    if (typeof duration !== 'number') {
      throw new Error('Argument 1 of FORMATDURATION must be a number (total seconds)');
    }
    if (duration < 0) {
        // As per spec: "If seconds_or_interval is not a number, throw an error."
        // "For now, only implement for numeric seconds."
        // "Handle days if the duration is very long (e.g., "DD:HH:MM:SS"). Salesforce: "Formats the number of seconds with optional days". Let's do "HH:MM:SS" and if HH > 23, then include days like "D.HH:MM:SS". Or simply allow HH to be > 23. Let's allow HH to be > 23 for simplicity."
        // Based on "Let's allow HH to be > 23 for simplicity", negative durations are not explicitly handled to output negative strings.
        // Throwing an error for negative seems consistent with "must be a number (total seconds)" implying positive.
        throw new Error('Argument 1 of FORMATDURATION must be a non-negative number');
    }

    const totalSeconds = Math.floor(duration);
    // Allow HH to be > 23, so no days calculation needed here
    const hours = Math.floor(totalSeconds / 3600);
    const remainingSecondsAfterHours = totalSeconds % 3600;
    const minutes = Math.floor(remainingSecondsAfterHours / 60);
    const seconds = remainingSecondsAfterHours % 60;

    const hh = hours.toString().padStart(2, '0'); // Will display > 23 if needed
    const mm = minutes.toString().padStart(2, '0');
    const ss = seconds.toString().padStart(2, '0');

    return `${hh}:${mm}:${ss}`;
  },
  'UPPER': (...args: Array<() => unknown>) => {
    const [textArg] = validateArgs(args, {min: 1, max: 1});
    const text = textArg();
    if (typeof text !== 'string') throw new Error('Argument 1 of UPPER must be a string');
    return text.toUpperCase();
  },
  'URLENCODE': (...args: Array<() => unknown>) => {
    const [textArg] = validateArgs(args, {min: 1, max: 1});
    const text = textArg();
    if (typeof text !== 'string') throw new Error('Argument 1 of URLENCODE must be a string');
    return encodeURIComponent(text);
  },
  'VALUE': (...args: Array<() => unknown>) => {
    const [textArg] = validateArgs(args, {min: 1, max: 1});
    const text = textArg();
    if (typeof text !== 'string') throw new Error('Argument 1 of VALUE must be a string');
    
    const trimmedText = text.trim();
    if (trimmedText === "") return null;

    const num = parseFloat(trimmedText);
    // Check if the original string (trimmed) was purely numeric or valid for parseFloat
    // This is a basic check; Salesforce might have more specific rules for what it considers a valid number string.
    // For example, "12.3.4" is NaN. "123foo" is 123.
    // Salesforce would error on "123foo". We should try to match this.
    if (isNaN(num)) return NaN; // Or throw new Error('Invalid string for VALUE conversion');
    
    // A more robust check to ensure the string was fully consumed by parseFloat
    // and doesn't contain trailing invalid characters.
    if (num.toString().length !== trimmedText.length) {
        // This check is imperfect because parseFloat(num.toString()) might not be the same as num if num is very large/small.
        // A regex might be better: /^-?\d+(\.\d+)?$/.test(trimmedText)
        // For now, we will accept parseFloat's behavior for "123foo" -> 123
        // but this is a known deviation from Salesforce which would error.
        // Let's refine this to be closer to Salesforce: if the string is not a valid number, return NaN.
        const isValidNumberString = /^-?((\d+(\.\d*)?)|(\.\d+))$/.test(trimmedText);
        if (!isValidNumberString) return NaN; // Or throw new Error('Invalid string for VALUE conversion');
    }
    return num;
  },

  // Logical Functions Start Here
  'AND': (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 1});
    for (let i = 0; i < args.length; i++) {
      const val = args[i]();
      if (typeof val !== 'boolean') {
        throw new Error(`Argument ${i + 1} of AND must be a boolean`);
      }
      if (!val) {
        return false; // Short-circuit
      }
    }
    return true;
  },

  'CASE': (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 3}); 
    
    const expression = args[0]();
    const numRemainingArgs = args.length - 1;

    // Iterate through value/result pairs
    // Each pair consists of 2 arguments.
    // If numRemainingArgs is odd, the last one is the else_result.
    const numPairs = Math.floor(numRemainingArgs / 2);

    for (let i = 0; i < numPairs; i++) {
      const valueN = args[1 + i * 2]();
      if (expression === valueN) {
        return args[1 + i * 2 + 1]();
      }
    }

    // Check for else_result: if there's an odd number of arguments after the expression
    if (numRemainingArgs % 2 !== 0) { 
      return args[args.length - 1]();
    }

    return null; 
  },

  'ISNULL': (...args: Array<() => unknown>) => {
    const [exprArg] = validateArgs(args, {min: 1, max: 1});
    const expr = exprArg();
    return expr === null || expr === undefined;
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

  'NULLVALUE': (...args: Array<() => unknown>) => {
    const [exprArg, substituteExprArg] = validateArgs(args, {min: 2, max: 2});
    const expr = exprArg();
    if (expr === null || expr === undefined) {
      return substituteExprArg();
    }
    return expr;
  },

  'OR': (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 1});
    for (let i = 0; i < args.length; i++) {
      const val = args[i]();
      if (typeof val !== 'boolean') {
        throw new Error(`Argument ${i + 1} of OR must be a boolean`);
      }
      if (val) {
        return true; // Short-circuit
      }
    }
    return false;
  },

  'ISCLONE': (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 0, max: 0});
    return false;
  },

  'ISNEW': (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 0, max: 0});
    return false;
  },

  'PRIORVALUE': (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 1, max: 1});
    // Argument field_expression is evaluated but not used in this mock
    args[0](); 
    return null;
  },

  // Advanced Functions Start Here
  'CURRENCYRATE': (...args: Array<() => unknown>) => {
    const [isoCodeExprArg] = validateArgs(args, {min: 1, max: 1});
    const iso_code_expr = isoCodeExprArg();

    if (typeof iso_code_expr !== 'string') {
      throw new Error('Argument 1 of CURRENCYRATE must be a string');
    }

    if (iso_code_expr === 'USD') return 1.0;
    if (iso_code_expr === 'EUR') return 0.92;
    if (iso_code_expr === 'GBP') return 0.79;
    // Handles empty string and any other string
    return 1.0; 
  },

  'REGEX': (...args: Array<() => unknown>) => {
    const [textExprArg, regexTextExprArg] = validateArgs(args, {min: 2, max: 2});
    const text_expr = textExprArg();
    const regex_text_expr = regexTextExprArg();

    if (typeof text_expr !== 'string') {
      throw new Error('Argument 1 of REGEX must be a string');
    }
    if (typeof regex_text_expr !== 'string') {
      throw new Error('Argument 2 of REGEX must be a string');
    }

    try {
      // Salesforce REGEX is case-sensitive by default. Standard JS RegExp is also case-sensitive.
      return new RegExp(regex_text_expr).test(text_expr);
    } catch (e: unknown) {
      if (e instanceof Error) {
        // Per prompt: "Invalid regex pattern provided to REGEX function: OriginalErrorName: OriginalErrorMessage"
        // However, the example in the first block was "Invalid regular expression in REGEX: [error message]"
        // Let's use the more detailed one from the "Error Handling" section.
        throw new Error(`Invalid regex pattern provided to REGEX function: ${e.name}: ${e.message}`);
      }
      // Should ideally not happen if 'e' is always an Error instance from RegExp constructor
      throw new Error('Invalid regular expression in REGEX: Unknown error');
    }
  },

  'ISCHANGED': (...args: Array<() => unknown>) => {
    const [fieldExpressionArg] = validateArgs(args, {min: 1, max: 1});
    // Evaluate the argument to ensure any side effects or errors from its evaluation propagate
    fieldExpressionArg(); 
    return false; // Mocked behavior
  }
}