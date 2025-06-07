import {completeFromList, snippet, type Completion as CompletionType } from "@codemirror/autocomplete"
import { formulaLanguage } from './language';

export const completionList: CompletionType[]= [
  {
    label: 'if',
    apply: snippet(`IF(\${true}, \${"ok"}, \${"ko"})`),
  },
  {
    label: 'ISBLANK',
    apply: snippet(`ISBLANK(\${value})`),
  },
  {
    label: 'NOT',
    apply: snippet(`NOT(\${value})`),
  },
  {
    label: 'BLANKVALUE',
    apply: snippet(`BLANKVALUE(\${value}, \${"Default"})`),
  },
  {
    label: 'NULLVALUE',
    apply: snippet(`BLANKVALUE(\${value}, \${"Default"})`),
  },
  {
    label: 'ISNULL',
    apply: snippet(`ISNULL(\${value})`),
  },
  {
    label: 'ISNUMBER',
    apply: snippet(`ISNULL(\${value})`),
  },
  {
    label: 'TEXT',
    apply: snippet(`TEXT(\${12})`),
  },
  {
    label: 'FLOOR',
    apply: snippet(`FLOOR(\${12.12})`),
  },
  {
    label: 'CEILING',
    apply: snippet(`CEILING(\${12.12})`),
  },
  {
    label: 'LEN',
    apply: snippet(`LEN(\${"Text"})`),
  },
  {
    label: 'true',
    apply: `true`,
  },
  {
    label: 'false',
    apply: `false`,
  },

]
export const Completion = formulaLanguage.data.of({
  autocomplete: completeFromList(completionList)
})