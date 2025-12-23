import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'D-Line ERP | Next App',
  description: 'Workflow và quản trị dự án trên nền Next.js'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}

