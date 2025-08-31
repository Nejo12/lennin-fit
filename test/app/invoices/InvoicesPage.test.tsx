import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import InvoicesPage from '../../../src/app/invoices/InvoicesPage';
import * as api from '../../../src/app/invoices/api';
import * as ai from '../../../src/app/invoices/ai';

// Mock the API hooks
vi.mock('../../../src/app/invoices/api');
vi.mock('../../../src/app/invoices/ai');

// Mock the InvoiceDetail component
vi.mock('../../../src/app/invoices/InvoiceDetail', () => ({
  default: ({ invoiceId }: { invoiceId: string }) => (
    <div data-testid="invoice-detail" data-invoice-id={invoiceId}>
      Invoice Detail for {invoiceId}
    </div>
  ),
}));

const mockApi = api as jest.Mocked<typeof api>;
const mockAi = ai as jest.Mocked<typeof ai>;

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe('InvoicesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    // Mock window.alert
    global.alert = vi.fn();
  });

  it('renders loading state', () => {
    mockApi.useInvoices.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof mockApi.useInvoices>);

    mockApi.useCreateInvoice.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useCreateInvoice>);

    mockApi.useSetInvoiceStatus.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof mockApi.useSetInvoiceStatus>);

    renderWithQueryClient(<InvoicesPage />);

    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockApi.useInvoices.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
    } as ReturnType<typeof mockApi.useInvoices>);

    mockApi.useCreateInvoice.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useCreateInvoice>);

    mockApi.useSetInvoiceStatus.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof mockApi.useSetInvoiceStatus>);

    renderWithQueryClient(<InvoicesPage />);

    expect(screen.getByText('Error loading invoices')).toBeInTheDocument();
  });

  it('renders empty state when no invoices', () => {
    mockApi.useInvoices.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof mockApi.useInvoices>);

    mockApi.useCreateInvoice.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useCreateInvoice>);

    mockApi.useSetInvoiceStatus.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof mockApi.useSetInvoiceStatus>);

    renderWithQueryClient(<InvoicesPage />);

    expect(
      screen.getByText('No invoices yet. Click "New".')
    ).toBeInTheDocument();
  });

  it('renders invoice list', () => {
    const mockInvoices = [
      {
        id: '12345678-1234-1234-1234-123456789012',
        client_id: 'client-1',
        issue_date: '2024-01-01',
        due_date: '2024-01-31',
        status: 'draft',
        amount_total: 1000,
        notes: 'Test invoice',
        created_at: '2024-01-01T00:00:00Z',
      },
    ];

    mockApi.useInvoices.mockReturnValue({
      data: mockInvoices,
      isLoading: false,
      error: null,
    } as ReturnType<typeof mockApi.useInvoices>);

    mockApi.useCreateInvoice.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useCreateInvoice>);

    mockApi.useSetInvoiceStatus.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof mockApi.useSetInvoiceStatus>);

    renderWithQueryClient(<InvoicesPage />);

    expect(screen.getByText('#123456 — draft')).toBeInTheDocument();
    expect(screen.getByText('€1000.00')).toBeInTheDocument();
  });

  it('creates new invoice when New button is clicked', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue('new-invoice-id');

    mockApi.useInvoices.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof mockApi.useInvoices>);

    mockApi.useCreateInvoice.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useCreateInvoice>);

    mockApi.useSetInvoiceStatus.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof mockApi.useSetInvoiceStatus>);

    renderWithQueryClient(<InvoicesPage />);

    const newButton = screen.getByText('New');
    fireEvent.click(newButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ notes: '' });
    });
  });

  it('handles AI suggest when button is clicked', async () => {
    const mockInvoices = [
      {
        id: '12345678-1234-1234-1234-123456789012',
        client_id: 'client-1',
        status: 'draft',
        amount_total: 1000,
        notes: 'Test invoice',
        created_at: '2024-01-01T00:00:00Z',
      },
    ];

    mockApi.useInvoices.mockReturnValue({
      data: mockInvoices,
      isLoading: false,
      error: null,
    } as ReturnType<typeof mockApi.useInvoices>);

    mockApi.useCreateInvoice.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useCreateInvoice>);

    mockApi.useSetInvoiceStatus.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof mockApi.useSetInvoiceStatus>);

    mockAi.suggestInvoice.mockResolvedValue({
      due_in_days: 14,
      items: [{ description: 'Test item', quantity: 1, unit_price: 100 }],
      notes: 'Test notes',
    });

    renderWithQueryClient(<InvoicesPage />);

    // Click on an invoice to select it
    const invoiceRow = screen.getByText('#123456 — draft');
    fireEvent.click(invoiceRow);

    // Click AI Suggest button
    const aiButton = screen.getByText('AI Suggest');
    fireEvent.click(aiButton);

    await waitFor(() => {
      expect(mockAi.suggestInvoice).toHaveBeenCalledWith({
        clientName: 'Client client',
        previousItems: [],
        recentTasks: [],
        currency: 'EUR',
      });
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      // Check for modal instead of alert
      expect(
        screen.getByText(
          'AI draft copied to clipboard. Paste into items, or wire auto-apply.'
        )
      ).toBeInTheDocument();
    });
  });

  it('updates invoice status when select changes', () => {
    const mockMutate = vi.fn();
    const mockInvoices = [
      {
        id: '12345678-1234-1234-1234-123456789012',
        client_id: 'client-1',
        status: 'draft',
        amount_total: 1000,
        notes: 'Test invoice',
        created_at: '2024-01-01T00:00:00Z',
      },
    ];

    mockApi.useInvoices.mockReturnValue({
      data: mockInvoices,
      isLoading: false,
      error: null,
    } as ReturnType<typeof mockApi.useInvoices>);

    mockApi.useCreateInvoice.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useCreateInvoice>);

    mockApi.useSetInvoiceStatus.mockReturnValue({
      mutate: mockMutate,
    } as unknown as ReturnType<typeof mockApi.useSetInvoiceStatus>);

    renderWithQueryClient(<InvoicesPage />);

    const statusSelect = screen.getByDisplayValue('draft');
    fireEvent.change(statusSelect, { target: { value: 'sent' } });

    expect(mockMutate).toHaveBeenCalledWith({
      id: '12345678-1234-1234-1234-123456789012',
      status: 'sent',
    });
  });

  it('disables AI Suggest button when no invoice is selected', () => {
    mockApi.useInvoices.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof mockApi.useInvoices>);

    mockApi.useCreateInvoice.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useCreateInvoice>);

    mockApi.useSetInvoiceStatus.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof mockApi.useSetInvoiceStatus>);

    renderWithQueryClient(<InvoicesPage />);

    const aiButton = screen.getByText('AI Suggest');
    expect(aiButton).toBeDisabled();
  });

  it('shows loading state for AI Suggest button', async () => {
    const mockInvoices = [
      {
        id: '12345678-1234-1234-1234-123456789012',
        client_id: 'client-1',
        status: 'draft',
        amount_total: 1000,
        notes: 'Test invoice',
        created_at: '2024-01-01T00:00:00Z',
      },
    ];

    mockApi.useInvoices.mockReturnValue({
      data: mockInvoices,
      isLoading: false,
      error: null,
    } as ReturnType<typeof mockApi.useInvoices>);

    mockApi.useCreateInvoice.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useCreateInvoice>);

    mockApi.useSetInvoiceStatus.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof mockApi.useSetInvoiceStatus>);

    mockAi.suggestInvoice.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithQueryClient(<InvoicesPage />);

    // Click on an invoice to select it
    const invoiceRow = screen.getByText('#123456 — draft');
    fireEvent.click(invoiceRow);

    // Click AI Suggest button
    const aiButton = screen.getByText('AI Suggest');
    fireEvent.click(aiButton);

    expect(screen.getByText('Thinking…')).toBeInTheDocument();
  });
});
