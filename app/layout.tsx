import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'D-Line ERP | Next App',
  description: 'Workflow và quản trị dự án trên nền Next.js',
  icons: {
    icon: '/img/logo/logo.png',
    shortcut: '/img/logo/logo.png',
    apple: '/img/logo/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

