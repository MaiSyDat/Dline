/**
 * NextAuth v5 Proxy (Edge-compatible)
 * 
 * Proxy file for Edge Runtime authentication
 * Exports auth function that can be used in middleware
 */

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Validate AUTH_SECRET - Generate a stable secret if not provided
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'd-line-dev-secret-key-change-in-production';

export const { auth } = NextAuth({
  ...authConfig,
  secret: authSecret,
});

