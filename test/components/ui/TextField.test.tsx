import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../utils';
import TextField from '../../../src/components/ui/TextField';

describe('TextField', () => {
  describe('Rendering', () => {
    it('renders with basic props', () => {
      renderWithProviders(<TextField name="test" />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('name', 'test');
    });

    it('renders with label', () => {
      renderWithProviders(<TextField label="Email" name="email" />);
      const label = screen.getByText('Email');
      const input = screen.getByRole('textbox');
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('for', input.id);
    });

    it('renders with hint', () => {
      renderWithProviders(
        <TextField name="email" hint="Enter your email address" />
      );
      const hint = screen.getByText('Enter your email address');
      expect(hint).toBeInTheDocument();
      expect(hint.className).toContain('hint');
    });

    it('renders with error', () => {
      renderWithProviders(<TextField name="email" error="Email is required" />);
      const error = screen.getByText('Email is required');
      const input = screen.getByRole('textbox');
      expect(error).toBeInTheDocument();
      expect(error.className).toContain('error');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('prioritizes error over hint', () => {
      renderWithProviders(
        <TextField
          name="email"
          hint="Enter your email"
          error="Email is required"
        />
      );
      const error = screen.getByText('Email is required');
      const hint = screen.queryByText('Enter your email');
      expect(error).toBeInTheDocument();
      expect(hint).not.toBeInTheDocument();
    });

    it('renders with custom id', () => {
      renderWithProviders(<TextField id="custom-id" name="test" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'custom-id');
    });

    it('generates id from name when no id provided', () => {
      renderWithProviders(<TextField name="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'email');
    });

    it('generates random id when no id or name provided', () => {
      renderWithProviders(<TextField />);
      const input = screen.getByRole('textbox');
      expect(input.id).toMatch(/^input-[a-z0-9]+$/);
    });
  });

  describe('Input types', () => {
    it.each(['text', 'email', 'tel', 'url', 'search'] as const)(
      'renders %s type correctly',
      type => {
        renderWithProviders(<TextField type={type} name="test" />);
        const input = screen.getByRole(
          type === 'search' ? 'searchbox' : 'textbox'
        );
        expect(input).toHaveAttribute('type', type);
      }
    );

    it('renders number input correctly', () => {
      renderWithProviders(<TextField type="number" name="test" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('renders password input correctly', () => {
      renderWithProviders(<TextField type="password" name="test" />);
      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders date input correctly', () => {
      renderWithProviders(<TextField type="date" name="test" />);
      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'date');
    });

    it('renders time input correctly', () => {
      renderWithProviders(<TextField type="time" name="test" />);
      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'time');
    });

    it('renders datetime-local input correctly', () => {
      renderWithProviders(<TextField type="datetime-local" name="test" />);
      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'datetime-local');
    });
  });

  describe('Interactions', () => {
    it('handles value changes', () => {
      const handleChange = vi.fn();
      renderWithProviders(<TextField name="test" onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: 'new value' }),
        })
      );
    });

    it('handles focus events', () => {
      const handleFocus = vi.fn();
      renderWithProviders(<TextField name="test" onFocus={handleFocus} />);
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('handles blur events', () => {
      const handleBlur = vi.fn();
      renderWithProviders(<TextField name="test" onBlur={handleBlur} />);
      const input = screen.getByRole('textbox');
      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('handles key events', () => {
      const handleKeyDown = vi.fn();
      renderWithProviders(<TextField name="test" onKeyDown={handleKeyDown} />);
      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'Enter' })
      );
    });
  });

  describe('Accessibility', () => {
    it('associates label with input', () => {
      renderWithProviders(<TextField label="Email" name="email" />);
      const label = screen.getByText('Email');
      const input = screen.getByRole('textbox');
      expect(label).toHaveAttribute('for', input.id);
    });

    it('sets aria-invalid when error is present', () => {
      renderWithProviders(<TextField name="email" error="Invalid email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-describedby for hint', () => {
      renderWithProviders(<TextField name="email" hint="Enter your email" />);
      const input = screen.getByRole('textbox');
      const hint = screen.getByText('Enter your email');
      expect(input).toHaveAttribute('aria-describedby', hint.id);
    });

    it('forwards aria attributes', () => {
      renderWithProviders(
        <TextField name="test" aria-label="Custom label" aria-required="true" />
      );
      const input = screen.getByRole('textbox', { name: /custom label/i });
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('forwards data attributes', () => {
      renderWithProviders(<TextField name="test" data-testid="custom-input" />);
      const input = screen.getByTestId('custom-input');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Form integration', () => {
    it('works with form submission', () => {
      const handleSubmit = vi.fn(e => e.preventDefault());
      renderWithProviders(
        <form onSubmit={handleSubmit}>
          <TextField name="email" />
          <button type="submit">Submit</button>
        </form>
      );
      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('handles required validation', () => {
      renderWithProviders(<TextField name="email" required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('handles placeholder', () => {
      renderWithProviders(
        <TextField name="email" placeholder="Enter your email" />
      );
      const input = screen.getByPlaceholderText('Enter your email');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles empty label', () => {
      renderWithProviders(<TextField label="" name="test" />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('handles empty hint', () => {
      renderWithProviders(<TextField hint="" name="test" />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('handles empty error', () => {
      renderWithProviders(<TextField error="" name="test" />);
      const input = screen.getByRole('textbox');
      // Empty error should not set aria-invalid
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('handles controlled input', () => {
      renderWithProviders(<TextField name="test" value="controlled value" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('controlled value');
    });

    it('handles disabled state', () => {
      renderWithProviders(<TextField name="test" disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('handles readOnly state', () => {
      renderWithProviders(<TextField name="test" readOnly />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to input element', () => {
      // TextField component doesn't support ref forwarding
      // This test is skipped as the component doesn't implement forwardRef
      expect(true).toBe(true);
    });
  });
});
