// app/layout.tsx
import type { Metadata } from "next";
import "@fontsource/cascadia-code";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "AI Chat Assistant",
  description: "AI-powered chat interface with document management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}