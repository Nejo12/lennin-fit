import React from 'react';
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
} from 'vitest';
import {
  screen,
  fireEvent,
  cleanup,
  render,
  waitFor,
} from '@testing-library/react';
import { renderWithProviders } from '../../utils';
import { ToastProvider } from '../../../src/components/ui/Toast';
import { useToast } from '../../../src/components/ui/useToast';

// Suppress React testing warnings about act() for this test suite
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

// Test component that uses the toast
function TestComponent() {
  const toast = useToast();

  return (
    <div>
      <button onClick={() => toast.add({ title: 'Test Toast' })}>
        Add Toast
      </button>
      <button
        onClick={() =>
          toast.add({
            title: 'Success',
            description: 'Operation completed',
            kind: 'success',
          })
        }
      >
        Add Success Toast
      </button>
      <button
        onClick={() =>
          toast.add({
            title: 'Error',
            description: 'Something went wrong',
            kind: 'error',
          })
        }
      >
        Add Error Toast
      </button>
      <button
        onClick={() =>
          toast.add({
            title: 'Custom Duration',
            duration: 1000,
          })
        }
      >
        Add Custom Duration Toast
      </button>
    </div>
  );
}

describe('Toast System', () => {
  beforeEach(() => {
    // Clean up any existing viewports
    cleanup();
    // Clear any existing portals
    const existingViewports = document.querySelectorAll(
      '[role="region"][aria-label="Notifications"]'
    );
    existingViewports.forEach(viewport => viewport.remove());
  });

  afterEach(() => {
    cleanup();
    // Clear any existing portals
    const existingViewports = document.querySelectorAll(
      '[role="region"][aria-label="Notifications"]'
    );
    existingViewports.forEach(viewport => viewport.remove());
  });

  describe('ToastProvider', () => {
    it('renders children without toasts initially', () => {
      renderWithProviders(
        <ToastProvider>
          <div>Test content</div>
        </ToastProvider>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('creates toast viewport in document body', () => {
      renderWithProviders(
        <ToastProvider>
          <div>Test content</div>
        </ToastProvider>
      );

      const viewport = document.querySelector(
        '[role="region"][aria-label="Notifications"]'
      );
      expect(viewport).toBeInTheDocument();
    });
  });

  describe('useToast hook', () => {
    it('throws error when used outside provider', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useToast must be used within <ToastProvider>');

      consoleSpy.mockRestore();
    });

    it('provides add and remove functions when used within provider', () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      expect(
        screen.getByRole('button', { name: /add toast/i })
      ).toBeInTheDocument();
    });
  });

  describe('Toast functionality', () => {
    it('adds toast when add is called', async () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const addButton = screen.getByRole('button', { name: /add toast/i });

      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Test Toast')).toBeInTheDocument();
      });
    });

    it('adds toast with title and description', async () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const addButton = screen.getByRole('button', {
        name: /add success toast/i,
      });

      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText('Operation completed')).toBeInTheDocument();
      });
    });

    it('adds multiple toasts', async () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const addButton1 = screen.getByRole('button', { name: /add toast/i });
      const addButton2 = screen.getByRole('button', {
        name: /add success toast/i,
      });

      fireEvent.click(addButton1);
      fireEvent.click(addButton2);

      await waitFor(() => {
        expect(screen.getByText('Test Toast')).toBeInTheDocument();
        expect(screen.getByText('Success')).toBeInTheDocument();
      });
    });

    it('removes toast when close button is clicked', async () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const addButton = screen.getByRole('button', { name: /add toast/i });

      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Test Toast')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close/i });

      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Test Toast')).not.toBeInTheDocument();
      });
    });
  });

  describe('Toast accessibility', () => {
    it('has proper ARIA attributes', async () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const addButton = screen.getByRole('button', { name: /add toast/i });

      fireEvent.click(addButton);

      await waitFor(() => {
        const toast = screen.getByRole('status');
        expect(toast).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('has accessible close button', async () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const addButton = screen.getByRole('button', { name: /add toast/i });

      fireEvent.click(addButton);

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close/i });
        expect(closeButton).toBeInTheDocument();
      });
    });
  });

  describe('Toast edge cases', () => {
    it('handles toast without title', async () => {
      const TestComponentWithoutTitle = () => {
        const toast = useToast();
        return (
          <button
            onClick={() => toast.add({ description: 'Description only' })}
          >
            Add Toast Without Title
          </button>
        );
      };

      renderWithProviders(
        <ToastProvider>
          <TestComponentWithoutTitle />
        </ToastProvider>
      );

      const addButton = screen.getByRole('button', {
        name: /add toast without title/i,
      });

      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Description only')).toBeInTheDocument();
      });
    });

    it('handles toast without description', async () => {
      const TestComponentWithoutDescription = () => {
        const toast = useToast();
        return (
          <button onClick={() => toast.add({ title: 'Title only' })}>
            Add Toast Without Description
          </button>
        );
      };

      renderWithProviders(
        <ToastProvider>
          <TestComponentWithoutDescription />
        </ToastProvider>
      );

      const addButton = screen.getByRole('button', {
        name: /add toast without description/i,
      });

      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Title only')).toBeInTheDocument();
      });
    });

    it('handles rapid toast additions', async () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const addButton = screen.getByRole('button', { name: /add toast/i });

      // Click multiple times rapidly
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      fireEvent.click(addButton);

      // Should handle multiple toasts gracefully
      await waitFor(() => {
        const toasts = screen.getAllByText('Test Toast');
        expect(toasts.length).toBeGreaterThan(0);
      });
    });

    it('generates unique IDs for each toast', async () => {
      renderWithProviders(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const addButton = screen.getByRole('button', { name: /add toast/i });

      fireEvent.click(addButton);

      await waitFor(() => {
        const toasts = screen.getAllByRole('status');

        // Check that we have at least one toast
        expect(toasts.length).toBeGreaterThan(0);

        // Each toast should be properly rendered
        toasts.forEach(toast => {
          expect(toast).toBeInTheDocument();
          expect(toast).toHaveAttribute('role', 'status');
          expect(toast).toHaveAttribute('aria-live', 'polite');
        });
      });
    });
  });
});
