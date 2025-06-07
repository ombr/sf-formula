import {completeFromList} from "@codemirror/autocomplete"
import { formulaLanguage } from './language';

export const Completion = formulaLanguage.data.of({
  autocomplete: completeFromList([
    {label: "IF", type: "keyword"},
    {label: "AND", type: "keyword"},
    {label: "OR", type: "keyword"},
    {label: "NOT", type: "function"},
    {label: "TRUE", type: "function"},
    {label: "FALSE", type: "function"}
  ])
})
