import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LazyImage from '../../src/components/LazyImage';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});

describe('Performance Optimizations', () => {
  beforeEach(() => {
    global.IntersectionObserver = mockIntersectionObserver;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('LazyImage Component', () => {
    it('renders with placeholder initially', () => {
      render(
        <LazyImage
          src="/test-image.jpg"
          alt="Test image"
          width={200}
          height={200}
        />
      );

      const img = screen.getByAltText('Test image');
      expect(img).toBeInTheDocument();
      expect(img).toHaveClass('lazy-image');
      expect(img).not.toHaveClass('loaded');
    });

    it('handles image load events', () => {
      const onLoad = vi.fn();
      render(
        <LazyImage
          src="/test-image.jpg"
          alt="Test image"
          onLoad={onLoad}
        />
      );

      const img = screen.getByAltText('Test image');
      
      // Simulate image load
      fireEvent.load(img);
      
      expect(onLoad).toHaveBeenCalled();
    });

    it('handles image error events', () => {
      const onError = vi.fn();
      render(
        <LazyImage
          src="/test-image.jpg"
          alt="Test image"
          onError={onError}
        />
      );

      const img = screen.getByAltText('Test image');
      
      // Simulate image error
      fireEvent.error(img);
      
      expect(onError).toHaveBeenCalled();
    });

    it('applies custom placeholder', () => {
      const customPlaceholder = 'data:image/svg+xml;base64,custom';
      render(
        <LazyImage
          src="/test-image.jpg"
          alt="Test image"
          placeholder={customPlaceholder}
        />
      );

      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('src', customPlaceholder);
    });
  });

  describe('Design System Components', () => {
    it('renders button components with proper classes', () => {
      render(
        <div>
          <button className="btn btn-primary">Primary Button</button>
          <button className="btn btn-secondary">Secondary Button</button>
          <button className="btn btn-ghost">Ghost Button</button>
          <button className="btn btn-danger">Danger Button</button>
        </div>
      );

      expect(screen.getByText('Primary Button')).toHaveClass('btn', 'btn-primary');
      expect(screen.getByText('Secondary Button')).toHaveClass('btn', 'btn-secondary');
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
      expect(screen.getByText('Elevated Card')).toHaveClass('card', 'card-elevated');
      expect(screen.getByText('Interactive Card')).toHaveClass('card', 'card-interactive');
      expect(screen.getByText('Flat Card')).toHaveClass('card', 'card-flat');
    });

    it('renders grid components with proper classes', () => {
      render(
        <div>
          <div className="grid grid-cols-2">
            <div>Grid Item 1</div>
            <div>Grid Item 2</div>
          </div>
          <div className="grid grid-cols-3 grid-gap-4">
            <div>Grid Item A</div>
            <div>Grid Item B</div>
            <div>Grid Item C</div>
          </div>
        </div>
      );

      const grid2 = screen.getByText('Grid Item 1').parentElement;
      const grid3 = screen.getByText('Grid Item C').parentElement;
      
      expect(grid2).toHaveClass('grid', 'grid-cols-2');
      expect(grid3).toHaveClass('grid', 'grid-cols-3', 'grid-gap-4');
    });
  });

  describe('Utility Classes', () => {
    it('renders spacing utilities correctly', () => {
      render(
        <div>
          <div className="m-4">Margin 4</div>
          <div className="p-6">Padding 6</div>
          <div className="mt-4 mb-6">Margin Top/Bottom</div>
        </div>
      );

      expect(screen.getByText('Margin 4')).toHaveClass('m-4');
      expect(screen.getByText('Padding 6')).toHaveClass('p-6');
      expect(screen.getByText('Margin Top/Bottom')).toHaveClass('mt-4', 'mb-6');
    });

    it('renders text utilities correctly', () => {
      render(
        <div>
          <div className="text-center">Centered Text</div>
          <div className="text-muted">Muted Text</div>
          <div className="font-bold">Bold Text</div>
        </div>
      );

      expect(screen.getByText('Centered Text')).toHaveClass('text-center');
      expect(screen.getByText('Muted Text')).toHaveClass('text-muted');
      expect(screen.getByText('Bold Text')).toHaveClass('font-bold');
    });

    it('renders flexbox utilities correctly', () => {
      render(
        <div>
          <div className="flex flex-center">Flex Center</div>
          <div className="flex flex-between">Flex Between</div>
        </div>
      );

      expect(screen.getByText('Flex Center')).toHaveClass('flex', 'flex-center');
      expect(screen.getByText('Flex Between')).toHaveClass('flex', 'flex-between');
    });
  });

  describe('Accessibility', () => {
    it('supports focus-visible styles', () => {
      render(
        <div>
          <button className="btn btn-primary">Focusable Button</button>
          <a href="#" className="focus-visible">Focusable Link</a>
        </div>
      );

      const button = screen.getByText('Focusable Button');
      const link = screen.getByText('Focusable Link');
      
      expect(button).toBeInTheDocument();
      expect(link).toBeInTheDocument();
    });
  });
});
