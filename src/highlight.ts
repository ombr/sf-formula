import { HighlightStyle } from "@codemirror/language";
import {styleTags, tags as t} from "@lezer/highlight"

export const formulaHighlight = styleTags({
  OrExpr: t.operator,
  Variable: t.string,
  Function: t.function(t.variableName),
  String: t.string,
  Number: t.number,
  Boolean: t.bool,
  Identifier: t.variableName,
  "Function > Identifier": t.function(t.variableName),
  AddOperator: t.operator,
  MulOperator: t.operator,
  CompOperator: t.operator,
  AndOperator: t.operator,
  OrOperator: t.operator,
  "( )": t.paren,
  ", .": t.separator
})

export const highlightStyle = HighlightStyle.define([
  { tag: t.string,       fontWeight: 'bold',       color: '#d73a49' },
  { tag: t.number,                               color: '#005cc5' },
  { tag: t.variableName,                          color: '#24292e' },
  { tag: t.function(t.variableName), fontStyle: 'italic', color: '#6f42c1' },
  { tag: t.operator,                              color: '#d73a49' },
  { tag: t.paren,                                 color: '#586069' }
]);