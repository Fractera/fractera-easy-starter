import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieBanner } from "@/components/cookie-banner";
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
  title: "Fractera — AI Coding Platform on Your Own Server",
  description:
    "Run Claude Code, Codex, Gemini CLI, Qwen Code and Kimi Code on a server you own. No API keys — use your own subscription. Live in 10 minutes.",
  metadataBase: new URL("https://fractera.ai"),
  openGraph: {
    type: "website",
    url: "https://fractera.ai",
    siteName: "Fractera",
    title: "Fractera — AI Coding Platform on Your Own Server",
    description:
      "Five AI coding platforms on a server you own. No API keys. Your own subscription. Your own domain. Live in 10 minutes.",
    images: [
      {
        url: "/fractera-logo.jpg",
        width: 1200,
        height: 630,
        alt: "Fractera — AI Coding Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fractera — AI Coding Platform on Your Own Server",
    description:
      "Five AI coding platforms on a server you own. No API keys. Your own subscription. Live in 10 minutes.",
    images: ["/fractera-logo.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "android-chrome-192", url: "/android-chrome-192x192.png" },
      { rel: "android-chrome-512", url: "/android-chrome-512x512.png" },
    ],
  },
  keywords: [
    "AI coding platform",
    "Claude Code",
    "Codex",
    "Gemini CLI",
    "Qwen Code",
    "Kimi Code",
    "own server",
    "no API key",
    "coding subscription",
    "self-hosted AI",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <SiteHeader />
          {children}
          <SiteFooter />
        </Providers>
        <CookieBanner />
        <Toaster position="top-center" theme="dark" />
      </body>
    </html>
  );
}
