import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { appRender } from './render';
import { supabase } from './mocks/supabase';

vi.mock('@/lib/supabase', () => ({ supabase }));
vi.mock('@/lib/workspace', () => ({ currentOrgId: async () => 'org_1' }));

import TasksPage from '../src/app/tasks/TasksPage';

const user = userEvent.setup();

describe('TasksPage', () => {
  it('creates a new task', async () => {
    appRender(<TasksPage />);
    const btn = await screen.findByRole('button', { name: /add task/i });
    await user.click(btn);
    await user.type(screen.getByPlaceholderText(/task title/i), 'Write tests');
    const submitButton = screen.getByRole('button', { name: /add task/i });
    await user.click(submitButton);
    await waitFor(() =>
      expect(screen.getByDisplayValue('Write tests')).toBeInTheDocument()
    );
  });
});
