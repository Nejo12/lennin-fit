/**
 * Performance optimization utilities
 */

// Type definitions for Performance API
interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
  target?: Element;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
  lastInputTime: number;
  sources?: Array<{
    node?: Node;
    currentRect?: DOMRectReadOnly;
    previousRect?: DOMRectReadOnly;
  }>;
}

// Lazy loading for images
export const lazyLoadImages = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          const srcset = img.dataset.srcset;

          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }

          if (srcset) {
            img.srcset = srcset;
            img.removeAttribute('data-srcset');
          }

          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      const imgElement = img as HTMLImageElement;
      const src = imgElement.dataset.src;
      const srcset = imgElement.dataset.srcset;

      if (src) {
        imgElement.src = src;
        imgElement.removeAttribute('data-src');
      }

      if (srcset) {
        imgElement.srcset = srcset;
        imgElement.removeAttribute('data-srcset');
      }

      imgElement.classList.remove('lazy');
    });
  }
};

// Lazy loading for components
export const lazyLoadComponents = () => {
  if ('IntersectionObserver' in window) {
    const componentObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const component = entry.target as HTMLElement;
          const loadEvent = new CustomEvent('lazyLoad', {
            detail: { component },
          });
          component.dispatchEvent(loadEvent);
          observer.unobserve(component);
        }
      });
    });

    const lazyComponents = document.querySelectorAll('[data-lazy]');
    lazyComponents.forEach(component => componentObserver.observe(component));
  }
};

// Preload critical resources
export const preloadCriticalResources = () => {
  const criticalResources = ['/favicon.svg', '/og.jpg'];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = resource.endsWith('.svg') ? 'image' : 'image';
    link.href = resource;
    document.head.appendChild(link);
  });
};

// Optimize font loading
export const optimizeFontLoading = () => {
  // Add font-display: swap to all font faces
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Inter';
      font-display: swap;
      src: url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    }
  `;
  document.head.appendChild(style);
};

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError);
    }
  }
};

// Performance monitoring
export const initPerformanceMonitoring = () => {
  // Monitor Core Web Vitals
  if ('PerformanceObserver' in window) {
    // LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);

      // Send to analytics if LCP is poor
      if (lastEntry.startTime > 2500) {
        console.warn('Poor LCP detected:', lastEntry.startTime);
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // FID (First Input Delay)
    const fidObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        const fidEntry = entry as FirstInputEntry;
        const fid = fidEntry.processingStart - fidEntry.startTime;
        console.log('FID:', fid);

        // Send to analytics if FID is poor
        if (fid > 100) {
          console.warn('Poor FID detected:', fid);
        }
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // CLS (Cumulative Layout Shift)
    const clsObserver = new PerformanceObserver(list => {
      let clsValue = 0;
      const entries = list.getEntries();
      entries.forEach(entry => {
        const clsEntry = entry as LayoutShiftEntry;
        if (!clsEntry.hadRecentInput) {
          clsValue += clsEntry.value;
        }
      });
      console.log('CLS:', clsValue);

      // Send to analytics if CLS is poor
      if (clsValue > 0.1) {
        console.warn('Poor CLS detected:', clsValue);
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }
};

// Resource hints optimization
export const addResourceHints = () => {
  const hints = [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
  ];

  hints.forEach(hint => {
    const link = document.createElement('link');
    Object.entries(hint).forEach(([key, value]) => {
      link.setAttribute(key, value);
    });
    document.head.appendChild(link);
  });
};

// Initialize all performance optimizations
export const initPerformanceOptimizations = () => {
  // Run immediately
  preloadCriticalResources();
  addResourceHints();
  initPerformanceMonitoring();

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      lazyLoadImages();
      lazyLoadComponents();
      optimizeFontLoading();
    });
  } else {
    lazyLoadImages();
    lazyLoadComponents();
    optimizeFontLoading();
  }

  // Register service worker
  registerServiceWorker();
};

// Export individual functions for manual use
export default {
  lazyLoadImages,
  lazyLoadComponents,
  preloadCriticalResources,
  optimizeFontLoading,
  registerServiceWorker,
  initPerformanceMonitoring,
  addResourceHints,
  initPerformanceOptimizations,
};
