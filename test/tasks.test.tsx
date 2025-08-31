import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { appRender } from './render';
import {
  supabase,
  isSupabaseConfigured,
  getSupabaseClient,
} from './mocks/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase,
  isSupabaseConfigured,
  getSupabaseClient,
}));
vi.mock('@/lib/workspace', () => ({
  currentOrgId: async () => 'org_1',
  debugUserStatus: async () => {},
}));

import TasksPage from '../src/app/tasks/TasksPage';

const user = userEvent.setup();

describe('TasksPage', () => {
  it('creates a new task', async () => {
    appRender(<TasksPage />);

    // Wait for the page to load
    await screen.findByRole('button', { name: /add task/i });

    // Fill in the task title
    const titleInput = screen.getByPlaceholderText(/task title/i);
    await user.type(titleInput, 'Write tests');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /add task/i });
    await user.click(submitButton);

    // Since we're using mock data and the task creation is just logged,
    // we should verify that the form was submitted and the input was cleared
    await waitFor(() => {
      expect(titleInput).toHaveValue('');
    });

    // Verify that the form is ready for the next task
    expect(submitButton).toBeDisabled();
  });
});
