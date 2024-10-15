import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Indonesia AGB Analysis',
  description: 'Generated by Ramadhan',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
