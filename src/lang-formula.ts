import { LRLanguage, LanguageSupport } from '@codemirror/language';
import { parser } from './parser';

export const formulaLanguage = LRLanguage.define({
  name: 'formula',
  parser: parser.configure({
    props: [],
  }),
  languageData: {
    closeBrackets: { brackets: ["(", '"'] },
  }
});

export function formula() {
  return new LanguageSupport(formulaLanguage)
}
export { parser };