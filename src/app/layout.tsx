"use client";

import { StoryProvider } from "@/lib/context/StoryContext";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StoryProvider>{children}</StoryProvider>
      </body>
    </html>
  );
}
