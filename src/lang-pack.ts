import { LanguageSupport } from '@codemirror/language';
import { parser } from './language';
import { formulaLanguage } from './language';
import { Completion } from './completion';


export function languagePack() {
  return new LanguageSupport(formulaLanguage, [Completion])
}
export { parser };