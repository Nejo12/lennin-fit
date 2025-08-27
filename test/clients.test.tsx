import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { appRender } from './render';

import { supabase } from './mocks/supabase';

// mock supabase + workspace
vi.mock('@/lib/supabase', () => ({ supabase }));
vi.mock('@/lib/workspace', () => ({ currentOrgId: async () => 'org_1' }));

import ClientsPage from '../src/app/clients/ClientsPage';

describe('ClientsPage', () => {
  it('adds a client', async () => {
    appRender(<ClientsPage />);
    const button = await screen.findByRole('button', { name: /add/i });
    fireEvent.click(button);
    fireEvent.change(screen.getByPlaceholderText(/client name/i), {
      target: { value: 'Acme Inc' },
    });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    await waitFor(() =>
      expect(screen.getByDisplayValue('Acme Inc')).toBeInTheDocument()
    );
  });
});
