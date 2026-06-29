import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CloudBase Test',
  description: 'CloudBase 自动化部署实验项目',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
