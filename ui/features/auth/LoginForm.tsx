/**
 * LoginForm Component
 * 
 * Form đăng nhập với NextAuth v5
 * Sử dụng signIn từ next-auth/react để xử lý authentication
 */

'use client';

import React, { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '../../components/Input';
import { PasswordInput } from '../../components/PasswordInput';
import { Button } from '../../components/Button';

/**
 * LoginForm component với NextAuth integration
 */
export const LoginForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Handle form submit với NextAuth signIn
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      // Sử dụng NextAuth signIn
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Xử lý các loại lỗi
        if (result.error === 'CredentialsSignin') {
          setError('Sai email hoặc mật khẩu');
        } else {
          setError('Đăng nhập thất bại. Vui lòng thử lại.');
        }
      } else if (result?.ok) {
        // Login thành công - reload để cập nhật session
        router.refresh();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm p-10 rounded-lg shadow-2xl modal-enter">
        {/* Logo và title */}
        <div className="text-center mb-10">
          <img 
            src="/img/logo/logo.png" 
            alt="D-Line Workflows" 
            className="w-16 h-16 mx-auto mb-4 object-contain"
          />
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">D-Line Workflows</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">
            Enterprise ERP
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="email"
            type="email"
            placeholder="email@company.com"
            required
            label="Email"
          />
          <PasswordInput
            name="password"
            placeholder="Mật khẩu"
            required
            label="Mật khẩu"
          />
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isSubmitting}
            className="shadow-xl shadow-primary/20"
          >
            Đăng nhập
          </Button>
        </form>

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-xs mt-4 text-center">{error}</p>
        )}
      </div>
    </div>
  );
};

