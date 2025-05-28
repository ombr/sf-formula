import { validateArgs } from "./functions";

export const textFunctions: Record<string, (...args: Array<()=> unknown>) => unknown> = {
  'TEXT': (...args: Array<() => unknown>) => {
    const value = validateArgs(args, {min: 1, max: 1})[0]();
    if(typeof value !== 'number') throw new Error('Argument should be a number');
    return value.toString();
  },
  'LEN': (...args: Array<() => unknown>) => {
    const value = validateArgs(args, {min: 1, max: 1})[0]();
    if(typeof value !== 'string') throw new Error('Argument should be a string');
    return value.length;
  },
  'ASCII': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 1, max: 1});
    const text = validatedArgs[0]();
    if (typeof text !== 'string') throw new Error('Argument should be a string');
    if (text.length === 0) return undefined;
    return text.codePointAt(0);
  },
  'BEGINS': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 2, max: 2});
    const text = validatedArgs[0]();
    const compare_text = validatedArgs[1]();
    if (typeof text !== 'string' || typeof compare_text !== 'string') {
      throw new Error('Both arguments should be strings');
    }
    return text.startsWith(compare_text);
  },
  'BR': (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 0, max: 0});
    return "<br>";
  },
  'CONTAINS': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 2, max: 2});
    const text = validatedArgs[0]();
    const compare_text = validatedArgs[1]();
    if (typeof text !== 'string' || typeof compare_text !== 'string') {
      throw new Error('Both arguments should be strings');
    }
    return text.includes(compare_text);
  },
  'FIND': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 2, max: 3});
    const search_text = validatedArgs[0]();
    const text = validatedArgs[1]();
    const start_num_arg = validatedArgs.length > 2 ? validatedArgs[2]() : undefined;

    if (typeof search_text !== 'string' || typeof text !== 'string') {
      throw new Error('The first two arguments (search_text and text) should be strings');
    }

    let start_pos = 0; 
    if (start_num_arg !== undefined) {
      if (typeof start_num_arg !== 'number' || !Number.isInteger(start_num_arg) || start_num_arg < 1) {
        throw new Error('start_num must be a positive integer');
      }
      start_pos = start_num_arg - 1; 
    }
    if (start_pos < 0) start_pos = 0; 
    
    const result = text.indexOf(search_text, start_pos);
    return result === -1 ? 0 : result + 1; 
  },
  'HTMLENCODE': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 1, max: 1});
    const text = validatedArgs[0]();
    if (typeof text !== 'string') throw new Error('Argument should be a string');
    return text.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&#39;');
  },
  'HYPERLINK': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 2, max: 3});
    const url = validatedArgs[0]();
    const friendly_name = validatedArgs[1]();
    const target = validatedArgs.length > 2 ? validatedArgs[2]() : undefined;

    if (typeof url !== 'string' || typeof friendly_name !== 'string') {
      throw new Error('URL and friendly_name must be strings');
    }
    if (target !== undefined && typeof target !== 'string') {
      throw new Error('Target must be a string if provided');
    }

    let link = `<a href="${url}"`;
    if (target) {
      link += ` target="${target}"`;
    }
    link += `>${friendly_name}</a>`;
    return link;
  },
  'IMAGE': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 2, max: 4});
    const image_url = validatedArgs[0]();
    const alternate_text = validatedArgs[1]();
    const height = validatedArgs.length > 2 ? validatedArgs[2]() : undefined;
    const width = validatedArgs.length > 3 ? validatedArgs[3]() : undefined;

    if (typeof image_url !== 'string' || typeof alternate_text !== 'string') {
      throw new Error('Image URL and alternate text must be strings');
    }

    let imgTag = `<img src="${image_url}" alt="${alternate_text}"`;

    if (height !== undefined && width !== undefined) {
      if (typeof height !== 'number' || typeof width !== 'number') {
        throw new Error('Height and width must be numbers');
      }
      imgTag += ` height="${height}" width="${width}"`;
    } else if (height !== undefined || width !== undefined) {
      throw new Error('Both height and width must be provided if one is specified');
    }
    imgTag += '>';
    return imgTag;
  },
  'INITCAP': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 1, max: 1});
    const text = validatedArgs[0]();
    if (typeof text !== 'string') throw new Error('Argument should be a string');
    if (!text) return '';
    return text.toLowerCase().replace(/(?:^|\s|-|\b)(\w)/g, (match) => match.toUpperCase());
  },
  'JSENCODE': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 1, max: 1});
    const text = validatedArgs[0]();
    if (typeof text !== 'string') throw new Error('Argument should be a string');
    return text.replace(/\\/g, '\\\\')
               .replace(/'/g, "\\'")
               .replace(/"/g, '\\"')
               .replace(/\n/g, '\\n')
               .replace(/\r/g, '\\r')
               .replace(/\t/g, '\\t')
               .replace(/\f/g, '\\f')
               .replace(/\v/g, '\\v') 
               .replace(/\b/g, '\\b') 
               .replace(/</g, '\\u003C') 
               .replace(/>/g, '\\u003E')
               .replace(/&/g, '\\u0026')
               .replace(/=/g, '\\u003D');
  },
  'JSINHTMLENCODE': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 1, max: 1});
    const text = validatedArgs[0]();
    if (typeof text !== 'string') throw new Error('Argument should be a string');
    
    const htmlEncodedText = textFunctions['HTMLENCODE'](() => text) as string;
    return textFunctions['JSENCODE'](() => htmlEncodedText);
  },
  'LEFT': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 2, max: 2});
    const text = validatedArgs[0]();
    const num_chars = validatedArgs[1]();

    if (typeof text !== 'string') throw new Error('First argument (text) should be a string');
    if (typeof num_chars !== 'number' || !Number.isInteger(num_chars) || num_chars < 0) {
      throw new Error('Second argument (num_chars) must be a non-negative integer');
    }

    if (num_chars === 0) return '';
    return text.substring(0, num_chars);
  },
  'LOWER': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 1, max: 2});
    const text = validatedArgs[0]();
    const locale = validatedArgs.length > 1 ? validatedArgs[1]() : undefined;

    if (typeof text !== 'string') throw new Error('First argument (text) should be a string');
    if (locale !== undefined && typeof locale !== 'string') {
      throw new Error('Second argument (locale) must be a string if provided');
    }

    if (locale) {
      try {
        return text.toLocaleLowerCase(locale);
      } catch (e) {
        throw e;
      }
    }
    return text.toLowerCase();
  },
  'LPAD': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 2, max: 3});
    let text = validatedArgs[0]();
    const padded_length = validatedArgs[1]();
    let pad_string = validatedArgs.length > 2 ? validatedArgs[2]() : ' ';

    if (typeof text !== 'string') throw new Error('First argument (text) must be a string');
    if (typeof padded_length !== 'number' || !Number.isInteger(padded_length) || padded_length < 0) {
      throw new Error('Second argument (padded_length) must be a non-negative integer');
    }
    if (typeof pad_string !== 'string') throw new Error('Third argument (pad_string) must be a string');

    if (pad_string === '') pad_string = ' '; 

    if (text.length >= padded_length) { 
      return text.substring(0, padded_length);
    }
    
    return text.padStart(padded_length, pad_string);
  },
  'MID': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 3, max: 3});
    const text = validatedArgs[0]();
    const start_num = validatedArgs[1]();
    const num_chars = validatedArgs[2]();

    if (typeof text !== 'string') throw new Error('First argument (text) must be a string');
    if (typeof start_num !== 'number' || !Number.isInteger(start_num) || start_num < 1) {
      throw new Error('Second argument (start_num) must be a positive integer');
    }
    if (typeof num_chars !== 'number' || !Number.isInteger(num_chars) || num_chars < 0) {
      throw new Error('Third argument (num_chars) must be a non-negative integer');
    }

    const zeroIndexedStart = start_num - 1;
    if (zeroIndexedStart >= text.length || num_chars <= 0) {
      return '';
    }
    
    return text.substring(zeroIndexedStart, zeroIndexedStart + num_chars);
  },
  'REVERSE': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 1, max: 1});
    const text = validatedArgs[0]();
    if (typeof text !== 'string') throw new Error('Argument must be a string');
    return text.split('').reverse().join('');
  },
  'RIGHT': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 2, max: 2});
    const text = validatedArgs[0]();
    const num_chars = validatedArgs[1]();

    if (typeof text !== 'string') throw new Error('First argument (text) must be a string');
    if (typeof num_chars !== 'number' || !Number.isInteger(num_chars) || num_chars < 0) {
      throw new Error('Second argument (num_chars) must be a non-negative integer');
    }

    if (num_chars === 0) return '';
    if (num_chars >= text.length) return text;
    return text.substring(text.length - num_chars);
  },
  'RPAD': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 2, max: 3});
    let text = validatedArgs[0]();
    const padded_length = validatedArgs[1]();
    let pad_string = validatedArgs.length > 2 ? validatedArgs[2]() : ' ';

    if (typeof text !== 'string') throw new Error('First argument (text) must be a string');
    if (typeof padded_length !== 'number' || !Number.isInteger(padded_length) || padded_length < 0) {
      throw new Error('Second argument (padded_length) must be a non-negative integer');
    }
    if (typeof pad_string !== 'string') throw new Error('Third argument (pad_string) must be a string');

    if (pad_string === '') pad_string = ' ';

    if (text.length >= padded_length) {
      return text.substring(0, padded_length); 
    }
    
    return text.padEnd(padded_length, pad_string);
  },
  'SUBSTITUTE': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 3, max: 4});
    const text = validatedArgs[0]();
    const old_text = validatedArgs[1]();
    const new_text = validatedArgs[2]();
    const occurrence_num = validatedArgs.length > 3 ? validatedArgs[3]() : undefined;

    if (typeof text !== 'string' || typeof old_text !== 'string' || typeof new_text !== 'string') {
      throw new Error('The first three arguments (text, old_text, new_text) must be strings');
    }
    if (occurrence_num !== undefined && (typeof occurrence_num !== 'number' || !Number.isInteger(occurrence_num) || occurrence_num < 1)) {
      throw new Error('Fourth argument (occurrence_num) must be a positive integer if provided');
    }

    if (old_text === '') return text;

    if (occurrence_num !== undefined) {
      let pos = -1;
      for (let i = 0; i < occurrence_num; i++) {
        pos = text.indexOf(old_text, pos + 1);
        if (pos === -1) break; 
      }

      if (pos !== -1) { 
        return text.substring(0, pos) + new_text + text.substring(pos + old_text.length);
      }
      return text; 
    } else {
      return text.split(old_text).join(new_text);
    }
  },
  'TRIM': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 1, max: 1});
    const text = validatedArgs[0]();
    if (typeof text !== 'string') throw new Error('Argument must be a string');
    return text.trim();
  },
  'UPPER': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 1, max: 2});
    const text = validatedArgs[0]();
    const locale = validatedArgs.length > 1 ? validatedArgs[1]() : undefined;

    if (typeof text !== 'string') throw new Error('First argument (text) should be a string');
    if (locale !== undefined && typeof locale !== 'string') {
      throw new Error('Second argument (locale) must be a string if provided');
    }

    if (locale) {
      try {
        return text.toLocaleUpperCase(locale);
      } catch (e) {
        throw e;
      }
    }
    return text.toUpperCase();
  },
  'URLENCODE': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 1, max: 1});
    const text = validatedArgs[0]();
    if (typeof text !== 'string') throw new Error('Argument must be a string');
    return encodeURIComponent(text);
  },
  'VALUE': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 1, max: 1});
    const text = validatedArgs[0]();
    if (typeof text !== 'string') throw new Error('Argument must be a string');
    const num = parseFloat(text);
    // parseFloat returns NaN if conversion is not possible, which is desired.
    return num; 
  },
  'CASESAFEID': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 1, max: 1});
    const id = validatedArgs[0]();

    if (typeof id !== 'string' || id.length !== 15) {
      // As per requirement: "or an error/original ID if input is not a 15-char string"
      // Throwing an error is more explicit about failure.
      throw new Error('Argument must be a 15-character string ID');
    }

    const suffixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ012345";
    let suffix = "";

    for (let i = 0; i < 3; i++) {
      let chunk = id.substring(i * 5, (i + 1) * 5);
      let binaryRepresentation = "";
      for (let j = 0; j < 5; j++) {
        // Check if char is uppercase (ASCII 65-90)
        binaryRepresentation += (chunk[j] >= 'A' && chunk[j] <= 'Z') ? "1" : "0";
      }
      // Reverse the binary string because Salesforce does it this way.
      suffix += suffixChars.charAt(parseInt(binaryRepresentation.split('').reverse().join(''), 2));
    }
    return id + suffix;
  },
  'GETSESSIONID': (...args: Array<() => unknown>) => {
    validateArgs(args, {min: 0, max: 0});
    return "mock_session_id";
  },
  'INCLUDES': (...args: Array<() => unknown>) => { // Note: This is different from String.prototype.includes
    const validatedArgs = validateArgs(args, {min: 2, max: 2});
    const multiselect_picklist_field = validatedArgs[0]();
    const text_literal = validatedArgs[1]();

    if (typeof multiselect_picklist_field !== 'string' || typeof text_literal !== 'string') {
      throw new Error('Both arguments must be strings');
    }
    if (multiselect_picklist_field === null || multiselect_picklist_field === undefined) return false;

    const values = multiselect_picklist_field.split(';');
    return values.includes(text_literal);
  },
  'ISPICKVAL': (...args: Array<() => unknown>) => {
    const validatedArgs = validateArgs(args, {min: 2, max: 2});
    const picklist_field = validatedArgs[0]();
    const text_literal = validatedArgs[1]();

    if (typeof picklist_field !== 'string' || typeof text_literal !== 'string') {
      // Allow null/undefined for picklist_field, it just won't match.
      // Or throw error if strict string type is required. For now, allow.
      if(typeof picklist_field !== 'string' && picklist_field !== null && picklist_field !== undefined) {
        throw new Error('Picklist_field argument must be a string, null, or undefined');
      }
      if(typeof text_literal !== 'string') {
         throw new Error('Text_literal argument must be a string');
      }
    }
    // Handles case where picklist_field might be null or undefined
    return picklist_field === text_literal;
  },
};
