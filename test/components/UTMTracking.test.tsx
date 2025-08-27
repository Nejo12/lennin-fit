import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Hero } from '../../src/components/Hero';
import { CTA } from '../../src/components/CTA';

describe('UTM Tracking', () => {
  it('Hero component includes UTM parameters in Try Lennin link', () => {
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );

    const tryLenninLink = screen.getByText('Try Lennin Free');
    expect(tryLenninLink).toBeInTheDocument();
    expect(tryLenninLink).toHaveAttribute(
      'href',
      'https://lennin.fit?utm_source=tilsf&utm_medium=website&utm_campaign=hero_cta'
    );
  });

  it('CTA component includes UTM parameters in Try Lennin link', () => {
    render(
      <BrowserRouter>
        <CTA />
      </BrowserRouter>
    );

    const tryLenninLink = screen.getByText('Try Lennin Free');
    expect(tryLenninLink).toBeInTheDocument();
    expect(tryLenninLink).toHaveAttribute(
      'href',
      'https://lennin.fit?utm_source=tilsf&utm_medium=website&utm_campaign=cta_section'
    );
  });
});
