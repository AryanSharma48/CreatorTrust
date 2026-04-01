import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CreatorTrust",
  description: "Verify Influence. Pay for Performance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-background text-foreground" suppressHydrationWarning>
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto max-w-7xl flex h-16 items-center px-4 md:px-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground">CreatorTrust</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
