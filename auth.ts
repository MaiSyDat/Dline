/**
 * NextAuth v5 Configuration
 * 
 * Cấu hình authentication với CredentialsProvider
 * Sử dụng MongoDB để verify user credentials
 * Chạy trên Node.js runtime (không phải Edge)
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getCollections } from '@/lib/db';
import { User, UserRole } from '@/types';
import { authConfig } from './auth.config';

// Validate AUTH_SECRET - Generate a stable secret if not provided
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'd-line-dev-secret-key-change-in-production';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Normalize email và password
          const email = (credentials.email as string).toLowerCase().trim();
          const password = (credentials.password as string).trim();

          // Lấy user từ MongoDB
          const { users } = await getCollections();
          const user = await users.findOne({
            email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
          });

          if (!user) {
            return null;
          }

          // So sánh password (plain-text comparison theo yêu cầu hiện tại)
          if (user.password !== password) {
            return null;
          }

          // Return user object (không bao gồm password)
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            image: user.avatar // NextAuth expects 'image' field
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Thêm user data vào token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      // Thêm user data vào session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.avatar = token.avatar as string;
      }
      return session;
    }
  },
  secret: authSecret,
});

