import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../src/components/ui/Toast';
import { vi } from 'vitest';

// Test data factories
export const createMockClient = (overrides = {}) => ({
  id: 'client_1',
  name: 'Test Client',
  email: 'test@example.com',
  phone: '+1234567890',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  organization_id: 'org_1',
  ...overrides,
});

export const createMockTask = (overrides = {}) => ({
  id: 'task_1',
  title: 'Test Task',
  description: 'Test description',
  status: 'todo',
  due_date: '2024-12-31',
  priority: 'medium',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  organization_id: 'org_1',
  ...overrides,
});

export const createMockInvoice = (overrides = {}) => ({
  id: 'invoice_1',
  client_id: 'client_1',
  number: 'INV-001',
  status: 'draft',
  total: 1000,
  due_date: '2024-12-31',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  organization_id: 'org_1',
  ...overrides,
});

export const createMockLead = (overrides = {}) => ({
  id: 'lead_1',
  name: 'Test Lead',
  email: 'lead@example.com',
  phone: '+1234567890',
  status: 'new',
  source: 'website',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  organization_id: 'org_1',
  ...overrides,
});

// Mock user
export const mockUser = {
  id: 'user_1',
  email: 'test@example.com',
  user_metadata: { name: 'Test User' },
  app_metadata: { provider: 'email' },
};

// Enhanced render function with all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    route = '/',
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity },
        mutations: { retry: false },
      },
    }),
    ...renderOptions
  } = options;

  window.history.pushState({}, 'Test page', route);

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ToastProvider>
    </BrowserRouter>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

// Common test helpers
export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0));

export const mockConsoleError = () => {
  const originalError = console.error;
  const mockError = vi.fn();
  console.error = mockError;
  return {
    mockError,
    restore: () => {
      console.error = originalError;
    },
  };
};

export const mockConsoleWarn = () => {
  const originalWarn = console.warn;
  const mockWarn = vi.fn();
  console.warn = mockWarn;
  return {
    mockWarn,
    restore: () => {
      console.warn = originalWarn;
    },
  };
};

// Mock Supabase responses
export const mockSupabaseResponse = (data: unknown, error: unknown = null) => ({
  data,
  error,
  count: null,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK',
});

// Mock React Query responses
export const mockQueryResponse = (data: unknown) => ({
  data,
  isLoading: false,
  isError: false,
  error: null,
  isSuccess: true,
  isFetching: false,
  isRefetching: false,
  dataUpdatedAt: Date.now(),
  errorUpdatedAt: 0,
  failureCount: 0,
  failureReason: null,
  errorUpdateCount: 0,
  isFetched: true,
  isFetchedAfterMount: true,
  isInitialLoading: false,
  isLoadingError: false,
  isPaused: false,
  isPlaceholderData: false,
  isPreviousData: false,
  isRefetchError: false,
  isStale: false,
  remove: vi.fn(),
  refetch: vi.fn(),
});

export const mockMutationResponse = () => ({
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  reset: vi.fn(),
  isIdle: true,
  isLoading: false,
  isSuccess: false,
  isError: false,
  data: undefined,
  error: null,
  isPaused: false,
  failureCount: 0,
  failureReason: null,
  submittedAt: 0,
  variables: undefined,
  context: undefined,
});

// Test constants
export const TEST_ORGANIZATION_ID = 'org_1';
export const TEST_USER_ID = 'user_1';

// Common assertions
export const expectElementToBeInDocument = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
};

export const expectElementNotToBeInDocument = (element: HTMLElement | null) => {
  expect(element).not.toBeInTheDocument();
};

export const expectElementToHaveText = (element: HTMLElement, text: string) => {
  expect(element).toHaveTextContent(text);
};

export const expectElementToHaveAttribute = (
  element: HTMLElement,
  attribute: string,
  value: string
) => {
  expect(element).toHaveAttribute(attribute, value);
};

// Re-export common testing utilities
export {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
  getByRole,
  getByText,
  getByTestId,
  queryByRole,
  queryByText,
  queryByTestId,
  findByRole,
  findByText,
  findByTestId,
  getAllByRole,
  getAllByText,
  getAllByTestId,
  queryAllByRole,
  queryAllByText,
  queryAllByTestId,
  findAllByRole,
  findAllByText,
  findAllByTestId,
} from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
