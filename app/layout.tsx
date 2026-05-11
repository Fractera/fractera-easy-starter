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
  title: "Fractera — Production-Coding AI Server",
  description:
    "Ship features faster with fewer tokens. Pre-built auth, database and routing. LightRAG keeps your full codebase in AI memory. Five coding platforms on your own server.",
  metadataBase: new URL("https://fractera.ai"),
  openGraph: {
    type: "website",
    url: "https://fractera.ai",
    siteName: "Fractera",
    title: "Fractera — Production-Coding AI Server",
    description:
      "Same AI platforms as everyone — but a fraction of the token waste. Production starters, LightRAG codebase memory, and component highlighting mean the AI skips straight to your feature. Five coding platforms. Your own server. Live in 10 minutes.",
    images: [
      {
        url: "/Fractera-start-image.jpg",
        width: 1920,
        height: 1080,
        alt: "Fractera — Production-Coding AI Server",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fractera — Production-Coding AI Server",
    description:
      "Same AI platforms — but far fewer tokens wasted. Production starters, LightRAG codebase memory, and component highlighting built in. Five platforms. Your server.",
    images: ["/Fractera-start-image.jpg"],
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
    "production coding AI",
    "Claude Code server",
    "Codex self-hosted",
    "Gemini CLI server",
    "LightRAG",
    "AI coding platform",
    "own server",
    "no API key",
    "fewer tokens",
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
