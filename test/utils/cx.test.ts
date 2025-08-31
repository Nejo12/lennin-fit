import { describe, it, expect } from 'vitest';
import { cx } from '../../src/utils/cx';

describe('cx utility', () => {
  it('joins multiple strings with spaces', () => {
    expect(cx('class1', 'class2', 'class3')).toBe('class1 class2 class3');
  });

  it('filters out falsy values', () => {
    expect(cx('class1', false, 'class2', null, 'class3', undefined)).toBe(
      'class1 class2 class3'
    );
  });

  it('handles empty string', () => {
    expect(cx('class1', '', 'class2')).toBe('class1 class2');
  });

  it('handles all falsy values', () => {
    expect(cx(false, null, undefined, '')).toBe('');
  });

  it('handles single truthy value', () => {
    expect(cx('class1')).toBe('class1');
  });

  it('handles single falsy value', () => {
    expect(cx(false)).toBe('');
  });

  it('handles no arguments', () => {
    expect(cx()).toBe('');
  });

  it('handles mixed types', () => {
    expect(cx('class1', false, 'class2', null, 'class3')).toBe(
      'class1 class2 class3'
    );
  });

  it('handles whitespace in strings', () => {
    expect(cx('class1 class2', 'class3')).toBe('class1 class2 class3');
  });

  it('handles empty array', () => {
    expect(cx()).toBe('');
  });

  it('handles array with mixed values', () => {
    const classes: Array<string | false | null | undefined> = [
      'class1',
      false,
      'class2',
      null,
      'class3',
    ];
    expect(cx(...classes)).toBe('class1 class2 class3');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    expect(
      cx('base-class', isActive && 'active', isDisabled && 'disabled')
    ).toBe('base-class active');
  });

  it('handles complex conditional logic', () => {
    const variant = 'primary';
    const size = 'large';
    const disabled = false;

    expect(
      cx(
        'button',
        variant === 'primary' && 'button--primary',
        size === 'large' && 'button--large',
        disabled && 'button--disabled'
      )
    ).toBe('button button--primary button--large');
  });

  it('handles nested conditional logic', () => {
    const theme = 'dark';
    const mode = 'compact';

    expect(
      cx(
        'component',
        theme === 'dark' && 'component--dark',
        theme === 'dark' && mode === 'compact' && 'component--dark--compact'
      )
    ).toBe('component component--dark component--dark--compact');
  });

  it('handles edge cases with special characters', () => {
    expect(
      cx('class-with-dash', 'class_with_underscore', 'classWithCamelCase')
    ).toBe('class-with-dash class_with_underscore classWithCamelCase');
  });

  it('handles numbers as strings', () => {
    expect(cx('class1', '2', 'class3')).toBe('class1 2 class3');
  });

  it('handles boolean false as falsy', () => {
    expect(cx('class1', false, 'class2')).toBe('class1 class2');
  });
});
