import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import InvoiceDetail from '../../../src/app/invoices/InvoiceDetail';
import * as api from '../../../src/app/invoices/api';

// Mock the API hooks
vi.mock('../../../src/app/invoices/api');

const mockApi = api as jest.Mocked<typeof api>;

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

describe('InvoiceDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.print
    global.window.print = vi.fn();
  });

  it('renders nothing when no invoiceId is provided', () => {
    // Mock the hook to return undefined when no invoiceId
    mockApi.useInvoiceItems.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof mockApi.useInvoiceItems>);

    mockApi.useAddItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useAddItem>);

    mockApi.useUpdateItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useUpdateItem>);

    mockApi.useDeleteItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useDeleteItem>);

    const { container } = renderWithQueryClient(<InvoiceDetail invoiceId="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders loading state', () => {
    mockApi.useInvoiceItems.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof mockApi.useInvoiceItems>);

    mockApi.useAddItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useAddItem>);

    mockApi.useUpdateItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useUpdateItem>);

    mockApi.useDeleteItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useDeleteItem>);

    renderWithQueryClient(<InvoiceDetail invoiceId="test-id" />);

    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders empty state when no items', () => {
    mockApi.useInvoiceItems.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof mockApi.useInvoiceItems>);

    mockApi.useAddItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useAddItem>);

    mockApi.useUpdateItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useUpdateItem>);

    mockApi.useDeleteItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useDeleteItem>);

    renderWithQueryClient(<InvoiceDetail invoiceId="test-id" />);

    expect(screen.getByText('No items yet.')).toBeInTheDocument();
  });

  it('renders invoice items table', () => {
    const mockItems = [
      {
        id: 'item-1',
        description: 'Test Item 1',
        quantity: 2,
        unit_price: 100,
        amount: 200,
      },
      {
        id: 'item-2',
        description: 'Test Item 2',
        quantity: 1,
        unit_price: 50,
        amount: 50,
      },
    ];

    mockApi.useInvoiceItems.mockReturnValue({
      data: mockItems,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof mockApi.useInvoiceItems>);

    mockApi.useAddItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useAddItem>);

    mockApi.useUpdateItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useUpdateItem>);

    mockApi.useDeleteItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useDeleteItem>);

    renderWithQueryClient(<InvoiceDetail invoiceId="test-id" />);

    // Use getByDisplayValue for input elements
    expect(screen.getByDisplayValue('Test Item 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Item 2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByText('200.00')).toBeInTheDocument();
    expect(screen.getByText('50.00')).toBeInTheDocument();
  });

  it('adds new item when Add item button is clicked', () => {
    const mockMutate = vi.fn();

    mockApi.useInvoiceItems.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof mockApi.useInvoiceItems>);

    mockApi.useAddItem.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useAddItem>);

    mockApi.useUpdateItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useUpdateItem>);

    mockApi.useDeleteItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useDeleteItem>);

    renderWithQueryClient(<InvoiceDetail invoiceId="test-id" />);

    const addButton = screen.getByText('+ Add item');
    fireEvent.click(addButton);

    expect(mockMutate).toHaveBeenCalledWith({
      invoice_id: 'test-id',
      description: 'New item',
      quantity: 1,
      unit_price: 0,
    });
  });

  it('updates item description on blur', () => {
    const mockMutate = vi.fn();
    const mockItems = [
      {
        id: 'item-1',
        description: 'Test Item 1',
        quantity: 2,
        unit_price: 100,
        amount: 200,
      },
    ];

    mockApi.useInvoiceItems.mockReturnValue({
      data: mockItems,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof mockApi.useInvoiceItems>);

    mockApi.useAddItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useAddItem>);

    mockApi.useUpdateItem.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useUpdateItem>);

    mockApi.useDeleteItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useDeleteItem>);

    renderWithQueryClient(<InvoiceDetail invoiceId="test-id" />);

    const descriptionInput = screen.getByDisplayValue('Test Item 1');
    fireEvent.change(descriptionInput, { target: { value: 'Updated Item' } });
    fireEvent.blur(descriptionInput);

    expect(mockMutate).toHaveBeenCalledWith({
      id: 'item-1',
      fields: { description: 'Updated Item' },
    });
  });

  it('updates item quantity on blur', () => {
    const mockMutate = vi.fn();
    const mockItems = [
      {
        id: 'item-1',
        description: 'Test Item 1',
        quantity: 2,
        unit_price: 100,
        amount: 200,
      },
    ];

    mockApi.useInvoiceItems.mockReturnValue({
      data: mockItems,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof mockApi.useInvoiceItems>);

    mockApi.useAddItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useAddItem>);

    mockApi.useUpdateItem.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useUpdateItem>);

    mockApi.useDeleteItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useDeleteItem>);

    renderWithQueryClient(<InvoiceDetail invoiceId="test-id" />);

    const quantityInput = screen.getByDisplayValue('2');
    fireEvent.change(quantityInput, { target: { value: '5' } });
    fireEvent.blur(quantityInput);

    expect(mockMutate).toHaveBeenCalledWith({
      id: 'item-1',
      fields: { quantity: 5 },
    });
  });

  it('updates item unit price on blur', () => {
    const mockMutate = vi.fn();
    const mockItems = [
      {
        id: 'item-1',
        description: 'Test Item 1',
        quantity: 2,
        unit_price: 100,
        amount: 200,
      },
    ];

    mockApi.useInvoiceItems.mockReturnValue({
      data: mockItems,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof mockApi.useInvoiceItems>);

    mockApi.useAddItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useAddItem>);

    mockApi.useUpdateItem.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useUpdateItem>);

    mockApi.useDeleteItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useDeleteItem>);

    renderWithQueryClient(<InvoiceDetail invoiceId="test-id" />);

    const priceInput = screen.getByDisplayValue('100');
    fireEvent.change(priceInput, { target: { value: '150' } });
    fireEvent.blur(priceInput);

    expect(mockMutate).toHaveBeenCalledWith({
      id: 'item-1',
      fields: { unit_price: 150 },
    });
  });

  it('deletes item when delete button is clicked', () => {
    const mockMutate = vi.fn();
    const mockItems = [
      {
        id: 'item-1',
        description: 'Test Item 1',
        quantity: 2,
        unit_price: 100,
        amount: 200,
      },
    ];

    mockApi.useInvoiceItems.mockReturnValue({
      data: mockItems,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof mockApi.useInvoiceItems>);

    mockApi.useAddItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useAddItem>);

    mockApi.useUpdateItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useUpdateItem>);

    mockApi.useDeleteItem.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useDeleteItem>);

    renderWithQueryClient(<InvoiceDetail invoiceId="test-id" />);

    const deleteButton = screen.getByTitle('Remove');
    fireEvent.click(deleteButton);

    expect(mockMutate).toHaveBeenCalledWith({ id: 'item-1' });
  });

  it('calls window.print when Print button is clicked', () => {
    mockApi.useInvoiceItems.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof mockApi.useInvoiceItems>);

    mockApi.useAddItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useAddItem>);

    mockApi.useUpdateItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useUpdateItem>);

    mockApi.useDeleteItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useDeleteItem>);

    renderWithQueryClient(<InvoiceDetail invoiceId="test-id" />);

    const printButton = screen.getByText('Print / Save PDF');
    fireEvent.click(printButton);

    expect(window.print).toHaveBeenCalled();
  });

  it('handles number input validation', () => {
    const mockItems = [
      {
        id: 'item-1',
        description: 'Test Item 1',
        quantity: 2,
        unit_price: 100,
        amount: 200,
      },
    ];

    mockApi.useInvoiceItems.mockReturnValue({
      data: mockItems,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof mockApi.useInvoiceItems>);

    mockApi.useAddItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useAddItem>);

    mockApi.useUpdateItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useUpdateItem>);

    mockApi.useDeleteItem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockApi.useDeleteItem>);

    renderWithQueryClient(<InvoiceDetail invoiceId="test-id" />);

    const quantityInput = screen.getByDisplayValue('2');
    expect(quantityInput).toHaveAttribute('min', '0');
    expect(quantityInput).toHaveAttribute('step', '0.5');

    const priceInput = screen.getByDisplayValue('100');
    expect(priceInput).toHaveAttribute('min', '0');
    expect(priceInput).toHaveAttribute('step', '0.01');
  });
});
