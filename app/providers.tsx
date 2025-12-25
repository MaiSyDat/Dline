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
  return <SessionProvider>{children}</SessionProvider>;
}

