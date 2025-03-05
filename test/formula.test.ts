import { formula_eval } from '../src/formula';

describe('formula_eval', () => {
  it('returns undefined for simple variable lookup with empty context', () => {
    expect(formula_eval('a', {})).toBeUndefined();
  });
});
