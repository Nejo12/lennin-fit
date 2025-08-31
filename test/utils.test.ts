import { describe, it, expect } from 'vitest';
import { cx } from '../src/utils/cx';

describe('cx utility', () => {
  it('combines class names correctly', () => {
    expect(cx('class1', 'class2')).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    expect(cx('base', 'conditional')).toBe('base conditional');
    expect(cx('base')).toBe('base');
  });

  it('handles mixed conditions', () => {
    expect(cx('base', 'true-class')).toBe('base true-class');
  });

  it('handles empty strings and null values', () => {
    expect(cx('base', '', null, undefined)).toBe('base');
  });

  it('handles multiple arguments', () => {
    expect(cx('base', 'class1', 'class2')).toBe('base class1 class2');
  });

  it('handles mixed types', () => {
    expect(cx('base', 'class1', false, null, undefined, 'class2')).toBe('base class1 class2');
  });
});
