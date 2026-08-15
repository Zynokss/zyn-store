'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function BFCacheFix() {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    // 1. Native Browser BFCache Fix (Physical Back Button)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener('pageshow', handlePageShow);

    // 2. Hard Reload when escaping the /auth flow
    if (prevPathRef.current && prevPathRef.current.includes('/auth') && !pathname.includes('/auth')) {
      window.location.reload(); 
    }
    
    prevPathRef.current = pathname;

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [pathname]);

  return null;
}