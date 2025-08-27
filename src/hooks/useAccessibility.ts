import React, { useEffect, useRef, useState, useCallback } from 'react';

// Accessibility hook for enhanced keyboard navigation and screen reader support
export const useAccessibility = () => {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);

  // Detect keyboard user
  useEffect(() => {
    const handleKeyDown = () => setIsKeyboardUser(true);
    const handleMouseDown = () => setIsKeyboardUser(false);
    const handleTouchStart = () => setIsKeyboardUser(false);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('touchstart', handleTouchStart);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  // Detect user preferences
  useEffect(() => {
    const mediaQueryReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );
    const mediaQueryHighContrast = window.matchMedia(
      '(prefers-contrast: high)'
    );

    setIsReducedMotion(mediaQueryReducedMotion.matches);
    setIsHighContrast(mediaQueryHighContrast.matches);

    const handleReducedMotionChange = (e: MediaQueryListEvent) =>
      setIsReducedMotion(e.matches);
    const handleHighContrastChange = (e: MediaQueryListEvent) =>
      setIsHighContrast(e.matches);

    mediaQueryReducedMotion.addEventListener(
      'change',
      handleReducedMotionChange
    );
    mediaQueryHighContrast.addEventListener('change', handleHighContrastChange);

    return () => {
      mediaQueryReducedMotion.removeEventListener(
        'change',
        handleReducedMotionChange
      );
      mediaQueryHighContrast.removeEventListener(
        'change',
        handleHighContrastChange
      );
    };
  }, []);

  // Focus management
  const trapFocus = useCallback(
    (containerRef: React.RefObject<HTMLElement>) => {
      const container = containerRef.current;
      if (!container) return;

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    },
    []
  );

  // Skip to content functionality
  const createSkipLink = useCallback(
    (targetId: string, text: string = 'Skip to main content') => {
      return React.createElement(
        'a',
        {
          href: `#${targetId}`,
          className: 'skip-link',
          style: {
            position: 'absolute',
            top: '-40px',
            left: '6px',
            background: '#000',
            color: '#fff',
            padding: '8px',
            textDecoration: 'none',
            zIndex: 1000,
            borderRadius: '4px',
            fontSize: '14px',
          },
          onFocus: (e: React.FocusEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.top = '6px';
          },
          onBlur: (e: React.FocusEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.top = '-40px';
          },
        },
        text
      );
    },
    []
  );

  // Announce to screen readers
  const announceToScreenReader = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', priority);
      announcement.setAttribute('aria-atomic', 'true');
      announcement.style.position = 'absolute';
      announcement.style.left = '-10000px';
      announcement.style.width = '1px';
      announcement.style.height = '1px';
      announcement.style.overflow = 'hidden';

      document.body.appendChild(announcement);

      // Use setTimeout to ensure the element is in the DOM
      setTimeout(() => {
        announcement.textContent = message;
        setTimeout(() => {
          document.body.removeChild(announcement);
        }, 1000);
      }, 100);
    },
    []
  );

  // Enhanced button with keyboard support
  const createAccessibleButton = useCallback(
    (
      props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
        children: React.ReactNode;
        onActivate?: () => void;
      }
    ) => {
      const { onActivate, ...buttonProps } = props;

      const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivate?.();
        }
      };

      return React.createElement('button', {
        ...buttonProps,
        onKeyDown: handleKeyDown,
        onClick: onActivate,
        role: 'button',
        tabIndex: 0,
      });
    },
    []
  );

  // Form validation announcements
  const announceFormValidation = useCallback(
    (isValid: boolean, message: string) => {
      announceToScreenReader(
        `${isValid ? 'Success' : 'Error'}: ${message}`,
        isValid ? 'polite' : 'assertive'
      );
    },
    [announceToScreenReader]
  );

  // Loading state announcements
  const announceLoadingState = useCallback(
    (isLoading: boolean, context: string) => {
      if (isLoading) {
        announceToScreenReader(`${context} is loading`);
      } else {
        announceToScreenReader(`${context} has finished loading`);
      }
    },
    [announceToScreenReader]
  );

  return {
    isKeyboardUser,
    isReducedMotion,
    isHighContrast,
    trapFocus,
    createSkipLink,
    announceToScreenReader,
    createAccessibleButton,
    announceFormValidation,
    announceLoadingState,
  };
};

// Hook for managing focus order
export const useFocusOrder = () => {
  const focusOrderRef = useRef<HTMLElement[]>([]);

  const registerFocusableElement = useCallback(
    (element: HTMLElement | null) => {
      if (element && !focusOrderRef.current.includes(element)) {
        focusOrderRef.current.push(element);
      }
    },
    []
  );

  const focusNext = useCallback(() => {
    const currentIndex = focusOrderRef.current.findIndex(
      el => el === document.activeElement
    );
    const nextIndex = (currentIndex + 1) % focusOrderRef.current.length;
    focusOrderRef.current[nextIndex]?.focus();
  }, []);

  const focusPrevious = useCallback(() => {
    const currentIndex = focusOrderRef.current.findIndex(
      el => el === document.activeElement
    );
    const prevIndex =
      currentIndex <= 0 ? focusOrderRef.current.length - 1 : currentIndex - 1;
    focusOrderRef.current[prevIndex]?.focus();
  }, []);

  return {
    registerFocusableElement,
    focusNext,
    focusPrevious,
  };
};

// Hook for managing ARIA states
export const useAriaState = (
  initialState: Record<string, string | boolean> = {}
) => {
  const [ariaStates, setAriaStates] = useState(initialState);

  const setAriaState = useCallback((key: string, value: string | boolean) => {
    setAriaStates(prev => ({ ...prev, [key]: value }));
  }, []);

  const getAriaProps = useCallback(() => {
    return Object.entries(ariaStates).reduce(
      (props, [key, value]) => {
        props[`aria-${key}`] = value;
        return props;
      },
      {} as Record<string, string | boolean>
    );
  }, [ariaStates]);

  return {
    ariaStates,
    setAriaState,
    getAriaProps,
  };
};
