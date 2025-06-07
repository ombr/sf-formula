import { LanguageSupport, syntaxHighlighting } from '@codemirror/language';
import { parser } from './language';
import { formulaLanguage } from './language';
import { Completion } from './completion';
import { highlightStyle } from './highlight';


export function languagePack() {
  return new LanguageSupport(formulaLanguage, [Completion, syntaxHighlighting(highlightStyle)])
}
export { parser };