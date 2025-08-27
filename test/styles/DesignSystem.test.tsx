import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Design System', () => {
  it('renders button components with proper classes', () => {
    render(
      <div>
        <button className="btn btn-primary">Primary Button</button>
        <button className="btn btn-secondary">Secondary Button</button>
        <button className="btn btn-ghost">Ghost Button</button>
        <button className="btn btn-danger">Danger Button</button>
      </div>
    );

    expect(screen.getByText('Primary Button')).toHaveClass(
      'btn',
      'btn-primary'
    );
    expect(screen.getByText('Secondary Button')).toHaveClass(
      'btn',
      'btn-secondary'
    );
    expect(screen.getByText('Ghost Button')).toHaveClass('btn', 'btn-ghost');
    expect(screen.getByText('Danger Button')).toHaveClass('btn', 'btn-danger');
  });

  it('renders card components with proper classes', () => {
    render(
      <div>
        <div className="card">Basic Card</div>
        <div className="card card-elevated">Elevated Card</div>
        <div className="card card-interactive">Interactive Card</div>
        <div className="card card-flat">Flat Card</div>
      </div>
    );

    expect(screen.getByText('Basic Card')).toHaveClass('card');
    expect(screen.getByText('Elevated Card')).toHaveClass(
      'card',
      'card-elevated'
    );
    expect(screen.getByText('Interactive Card')).toHaveClass(
      'card',
      'card-interactive'
    );
    expect(screen.getByText('Flat Card')).toHaveClass('card', 'card-flat');
  });

  it('renders input components with proper classes', () => {
    render(
      <div>
        <input className="input" placeholder="Basic Input" />
        <input className="input input-sm" placeholder="Small Input" />
        <input className="input input-lg" placeholder="Large Input" />
        <input className="input input-search" placeholder="Search Input" />
      </div>
    );

    expect(screen.getByPlaceholderText('Basic Input')).toHaveClass('input');
    expect(screen.getByPlaceholderText('Small Input')).toHaveClass(
      'input',
      'input-sm'
    );
    expect(screen.getByPlaceholderText('Large Input')).toHaveClass(
      'input',
      'input-lg'
    );
    expect(screen.getByPlaceholderText('Search Input')).toHaveClass(
      'input',
      'input-search'
    );
  });

  it('renders grid components with proper classes', () => {
    render(
      <div>
        <div className="grid grid-cols-2">
          <div>Grid 2 Item 1</div>
          <div>Grid 2 Item 2</div>
        </div>
        <div className="grid grid-cols-3 grid-gap-4">
          <div>Grid 3 Item 1</div>
          <div>Grid 3 Item 2</div>
          <div>Grid 3 Item 3</div>
        </div>
      </div>
    );

    const grid2 = screen.getByText('Grid 2 Item 1').parentElement;
    const grid3 = screen.getByText('Grid 3 Item 3').parentElement;

    expect(grid2).toHaveClass('grid', 'grid-cols-2');
    expect(grid3).toHaveClass('grid', 'grid-cols-3', 'grid-gap-4');
  });

  it('renders utility classes correctly', () => {
    render(
      <div>
        <div className="text-center">Centered Text</div>
        <div className="text-muted">Muted Text</div>
        <div className="font-bold">Bold Text</div>
        <div className="m-4 p-2">Spaced Element</div>
      </div>
    );

    expect(screen.getByText('Centered Text')).toHaveClass('text-center');
    expect(screen.getByText('Muted Text')).toHaveClass('text-muted');
    expect(screen.getByText('Bold Text')).toHaveClass('font-bold');
    expect(screen.getByText('Spaced Element')).toHaveClass('m-4', 'p-2');
  });
});
