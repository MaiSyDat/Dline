/**
 * NextAuth Type Definitions
 * 
 * Extend NextAuth types để thêm custom fields (role, avatar)
 */

import { UserRole } from '@/types';
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    role: UserRole;
    avatar: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      avatar: string;
      image?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    avatar: string;
  }
}

