/**
 * NextAuth v5 Configuration (Edge-compatible)
 * 
 * Config cơ bản cho middleware (không import MongoDB)
 * Middleware chạy trên Edge Runtime, không hỗ trợ Node.js modules
 */

import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/', // Redirect to home page for login
  },
  session: {
    strategy: 'jwt',
  },
  providers: [], // Providers được định nghĩa trong auth.ts
};

