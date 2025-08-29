import { useEffect } from 'react';

export function DocumentHydrationGuard() {
  useEffect(() => {
    // Double protection for critical elements
    const verifyCriticalElements = () => {
      // 1. HTML lang attribute
      if (!document.documentElement.lang) {
        document.documentElement.lang = 'en';
      }
      
      // 2. Viewport meta tag - properly typed as HTMLMetaElement
      let viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.setAttribute('name', 'viewport');
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
        document.head.prepend(viewport);
      } else if (!viewport.getAttribute('content')) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
      
      // 3. Title element
      if (!document.title) {
        document.title = 'Local AI';
      }
      
      // 4. Charset meta - properly typed as HTMLMetaElement
      let charset = document.querySelector<HTMLMetaElement>('meta[charset]');
      if (!charset) {
        charset = document.createElement('meta');
        charset.setAttribute('charset', 'UTF-8');
        document.head.prepend(charset);
      }
    };

    // Run immediately
    verifyCriticalElements();
    
    // Set up periodic verification (every 2 seconds)
    const interval = setInterval(verifyCriticalElements, 2000);
    
    return () => {
      clearInterval(interval);
      // Final verification on unmount
      verifyCriticalElements();
    };
  }, []);

  return null;
}