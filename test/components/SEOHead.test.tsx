import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SEOHead } from '../../src/components/SEOHead';

describe('SEOHead', () => {
  it('should render nothing (return null)', () => {
    const { container } = render(<SEOHead />);
    expect(container.firstChild).toBeNull();
  });

  it('should accept props without crashing', () => {
    const { container } = render(
      <SEOHead
        title="Test Title"
        description="Test Description"
        canonical="https://example.com"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should handle missing props gracefully', () => {
    const { container } = render(<SEOHead />);
    expect(container.firstChild).toBeNull();
  });

  it('should handle all optional props', () => {
    const { container } = render(
      <SEOHead
        title="Custom Title"
        description="Custom Description"
        keywords="custom, keywords"
        ogImage="/custom-image.jpg"
        ogUrl="https://custom.com"
        canonical="https://custom.com/page"
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
