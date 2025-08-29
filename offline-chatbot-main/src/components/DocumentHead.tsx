// src/components/DocumentHead.tsx
import { useEffect } from 'react';

interface DocumentHeadProps {
  title?: string;
  description?: string;
  lang?: string;
}

export function DocumentHead({
  title = 'Local AI',
  description = 'Interactive AI application',
  lang = 'en'
}: DocumentHeadProps) {
  useEffect(() => {
    // Set document title
    document.title = title;
    
    // Set HTML lang attribute
    document.documentElement.lang = lang;
    
    // Manage meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);
    
    // Manage viewport
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      document.head.appendChild(viewport);
    }
  }, [title, description, lang]);

  return null;
}