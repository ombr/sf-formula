import {completeFromList, snippet, type Completion as CompletionType } from "@codemirror/autocomplete"
import { formulaLanguage } from './language';

const singleArg = ['NOT', 'ABS', 'ACOS', 'ASIN', 'SIN', 'TAN', 'ATAN', 'ATAN2', 'EXP', 'LN', 'LOG', 'ISNUMBER','ISBLANK', 'ISNULL', 'TEXT','FLOOR', 'CEILING', 'LEN', 'MCEILING', 'MFLOOR', 'SQRT'].map((func)=> {
  return {
    label: func,
    apply: snippet(`${func}(\${value})`),
  };
})
export const completionList: CompletionType[]= [
  {
    label: 'IF',
    apply: snippet(`IF(\n\t\${true},\n\t\${"ok"},\n\t\${"ko"}\n)`),
  },
  {
    label: 'CASE',
    apply: snippet(`CASE(\n\t\${value},\n\t\${true}, \${"ok"},\n\t\${false},\${"KO"}\n)`),
  },
  {
    label: 'MIN',
    apply: snippet(`MIN(\${0:value}, \${1:0})`),
  },
  {
    label: 'MAX',
    apply: snippet(`MAX(\${0:value}, \${1:0})`),
  },
  ...singleArg,
  {
    label: 'NOT',
    apply: snippet(`NOT(\${value})`),
  },
  {
    label: 'ROUND',
    apply: snippet(`ROUND(\${value}, \${2})`),
  },
  {
    label: 'TRUNC',
    apply: snippet(`TRUNC(\${value}, \${2})`),
  },
  {
    label: 'ROUND',
    apply: snippet(`ROUND(\${value}, \${2})`),
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