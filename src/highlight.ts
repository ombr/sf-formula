import {styleTags, tags as t} from "@lezer/highlight"

export const formulaHighlighting = styleTags({
  String: t.string,
  Number: t.number,
  "true false": t.bool,
  Boolean: t.bool,
  Identifier: t.variableName,
  Function: t.function(t.variableName),
  Variable: t.variableName,
  VariableField: t.propertyName,
  "AddOperator": t.arithmeticOperator,
  "MulOperator": t.arithmeticOperator,
  "CompOperator": t.compareOperator,
  "AndOperator OrOperator": t.operator,
  "&& || AND OR": t.logicOperator,
  "( )": t.paren,
  ", .": t.separator
}) 