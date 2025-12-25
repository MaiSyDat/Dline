/**
 * Providers Component
 * 
 * Wrapper cho NextAuth SessionProvider
 * Cung cấp session context cho toàn bộ ứng dụng
 */

'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={0} // Tắt auto-refetch session
      refetchOnWindowFocus={false} // Tắt refetch khi focus window
    >
      {children}
    </SessionProvider>
  );
}

