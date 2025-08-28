import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './testServer';

// polyfill fetch
import 'whatwg-fetch';

// Suppress React testing warnings about act() for portal-based components
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes(
        'An update to ToastProvider inside a test was not wrapped in act'
      )
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

// Mock SCSS modules so imports work
vi.mock('*.module.scss', () => {
  const generateClassName = (baseName: string) => {
    const hash = Math.random().toString(36).substring(2, 8);
    return `_${baseName}_${hash}`;
  };

  return {
    root: generateClassName('root'),
    primary: generateClassName('primary'),
    ghost: generateClassName('ghost'),
    danger: generateClassName('danger'),
    sm: generateClassName('sm'),
    md: generateClassName('md'),
    lg: generateClassName('lg'),
    block: generateClassName('block'),
    disabled: generateClassName('disabled'),
    card: generateClassName('card'),
    header: generateClassName('header'),
    title: generateClassName('title'),
    sub: generateClassName('sub'),
    content: generateClassName('content'),
    footer: generateClassName('footer'),
    input: generateClassName('input'),
    label: generateClassName('label'),
    hint: generateClassName('hint'),
    error: generateClassName('error'),
    viewport: generateClassName('viewport'),
    toast: generateClassName('toast'),
    desc: generateClassName('desc'),
    row: generateClassName('row'),
    tasks: generateClassName('tasks'),
    taskInput: generateClassName('taskInput'),
    taskDate: generateClassName('taskDate'),
    submitButton: generateClassName('submitButton'),
    taskList: generateClassName('taskList'),
    taskItem: generateClassName('taskItem'),
    taskSelect: generateClassName('taskSelect'),
    form: generateClassName('form'),
    formRow: generateClassName('formRow'),
  };
});

// MSW lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
