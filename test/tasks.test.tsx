import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { appRender } from './render';
import { supabase } from './mocks/supabase';

vi.mock('@/lib/supabase', () => ({ supabase }));
vi.mock('@/lib/workspace', () => ({ currentOrgId: async () => 'org_1' }));

import TasksPage from '../src/app/tasks/TasksPage';

describe('TasksPage', () => {
  it('creates a new task', async () => {
    appRender(<TasksPage />);
    const btn = await screen.findByRole('button', { name: /add task/i });
    fireEvent.click(btn);
    fireEvent.change(screen.getByPlaceholderText(/task title/i), {
      target: { value: 'Write tests' },
    });
    const submitButton = screen.getByRole('button', { name: /adding/i });
    fireEvent.click(submitButton);
    await waitFor(() =>
      expect(screen.getByDisplayValue('Write tests')).toBeInTheDocument()
    );
  });
});
