import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './testServer';

// polyfill fetch
import 'whatwg-fetch';

// Mock SCSS modules so imports work
vi.mock('*.module.scss', () => ({}));

// MSW lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
