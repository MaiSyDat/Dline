/**
 * LoginForm Component
 * 
 * Form đăng nhập với email và password
 * Xử lý validation và error messages
 */

'use client';

import React, { useState, FormEvent } from 'react';
import { User } from '@/types';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { fetchJson } from '../../utils/api';

export interface LoginFormProps {
  /** Callback khi login thành công */
  onLoginSuccess: (user: User) => void;
  /** Số lượng users trong DB (để hiển thị message) */
  userCount?: number;
}

/**
 * LoginForm component với email/password validation
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  userCount = 0
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetchJson<{ ok: true; data: User }>('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password')
        })
      });
      
      onLoginSuccess(res.data);
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
          <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black mx-auto mb-4">
            D
          </div>
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
            placeholder="Email"
            required
            label="Email"
          />
          <Input
            name="password"
            type="password"
            placeholder="Mật khẩu"
            required
            label="Mật khẩu"
          />
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isSubmitting}
            className="shadow-xl shadow-slate-900/10"
          >
            Đăng nhập
          </Button>
        </form>

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-xs mt-4 text-center">{error}</p>
        )}

        {/* Info message nếu chưa có user */}
        {userCount === 0 && (
          <p className="text-[11px] text-slate-500 text-center mt-4">
            Chưa có user trong DB. Tạo mới bằng API /api/users (POST) rồi đăng nhập.
          </p>
        )}
      </div>
    </div>
  );
};

