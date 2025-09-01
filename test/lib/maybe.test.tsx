import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Maybe } from '../../src/lib/maybe';

describe('Maybe', () => {
  it('should render children when condition is true', () => {
    render(
      <Maybe if={true}>
        <div data-testid="content">Hello World</div>
      </Maybe>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should not render children when condition is false', () => {
    render(
      <Maybe if={false}>
        <div data-testid="content">Hello World</div>
      </Maybe>
    );

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    expect(screen.queryByText('Hello World')).not.toBeInTheDocument();
  });

  it('should handle complex children', () => {
    render(
      <Maybe if={true}>
        <div>
          <h1>Title</h1>
          <p>Description</p>
          <button>Click me</button>
        </div>
      </Maybe>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle string children', () => {
    render(<Maybe if={true}>Simple text</Maybe>);

    expect(screen.getByText('Simple text')).toBeInTheDocument();
  });

  it('should handle number children', () => {
    render(<Maybe if={true}>{42}</Maybe>);

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should handle null children when condition is false', () => {
    const { container } = render(
      <Maybe if={false}>
        <div>Content</div>
      </Maybe>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should handle multiple children', () => {
    render(
      <Maybe if={true}>
        <div>First</div>
        <div>Second</div>
        <div>Third</div>
      </Maybe>
    );

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });
});
