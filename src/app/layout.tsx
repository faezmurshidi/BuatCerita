"use client";

import { StoryProvider } from "@/lib/context/StoryContext";
import "./globals.css";
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/lib/context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <StoryProvider>{children}</StoryProvider>
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
