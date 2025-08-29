import { useEffect } from 'react';

interface DocumentHeadProps {
  title?: string;
  description?: string;
  lang?: string;
  themeColor?: string;
}

export function DocumentHeadManager({
  title = 'Local AI',
  description = 'Interactive AI application interface',
  lang = 'en',
  themeColor = '#ffffff'
}: DocumentHeadProps) {
  useEffect(() => {
    // Safeguard critical HTML attributes first
    const safeguardAttributes = () => {
      const html = document.documentElement;
      
      // 1. Ensure lang attribute exists and is correct
      if (!html.lang || html.lang !== lang) {
        html.lang = lang;
      }

      // 2. Ensure theme data attribute exists
      if (!html.getAttribute('data-theme')) {
        html.setAttribute('data-theme', 'light');
      }
    };

    // Manage all head elements
    const manageHeadElements = () => {
      // 1. Title management
      if (document.title !== title) {
        document.title = title;
      }

      // 2. Meta tags management
      const metaTags = [
        { 
          name: 'description', 
          content: description,
          fallbackPosition: 'before-title'
        },
        { 
          name: 'viewport', 
          content: 'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no',
          fallbackPosition: 'first'
        },
        { 
          name: 'theme-color', 
          content: themeColor,
          fallbackPosition: 'after-viewport'
        }
      ];

      metaTags.forEach(({ name, content, fallbackPosition }) => {
        let tag = document.querySelector(`meta[name="${name}"]`);
        
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('name', name);
          
          // Strategic placement based on priority
          switch (fallbackPosition) {
            case 'first':
              document.head.prepend(tag);
              break;
            case 'before-title':
              const titleTag = document.querySelector('title');
              titleTag?.before(tag);
              break;
            default:
              document.head.appendChild(tag);
          }
        }
        
        // Update content if different
        if (tag.getAttribute('content') !== content) {
          tag.setAttribute('content', content);
        }
      });

      // 3. Charset fallback (should never be needed with proper HTML)
      if (!document.querySelector('meta[charset]')) {
        const charset = document.createElement('meta');
        charset.setAttribute('charset', 'UTF-8');
        document.head.prepend(charset);
      }
    };

    // Run initial checks
    safeguardAttributes();
    manageHeadElements();

    // Set up mutation observer to maintain state
    const observer = new MutationObserver((mutations) => {
      let needsUpdate = mutations.some(mutation => {
        // Check if important elements were modified
        return Array.from(mutation.addedNodes).some(node => {
          return node.nodeName === 'TITLE' || 
                 (node.nodeName === 'META' && 
                  ['description', 'viewport', 'theme-color'].includes((node as HTMLMetaElement).name));
        });
      });

      if (needsUpdate) {
        safeguardAttributes();
        manageHeadElements();
      }
    });

    // Observe the head element
    observer.observe(document.head, {
      childList: true,
      subtree: true
    });

    // Cleanup
    return () => observer.disconnect();
  }, [title, description, lang, themeColor]);

  return null;
}