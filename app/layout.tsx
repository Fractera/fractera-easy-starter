import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fractera — Open-Source Production AI Development Workspace",
  description:
    "Open-source. Your own server and live domain in seconds. Production AI development workspace with 5 platforms, database, agents, and LightRAG memory — ready to build.",
  metadataBase: new URL("https://www.fractera.ai"),
  openGraph: {
    type: "website",
    url: "https://www.fractera.ai",
    siteName: "Fractera",
    title: "Fractera — Open-Source Production AI Development Workspace",
    description:
      "Open-source. Your own server and live domain in seconds. Production AI development workspace with 5 platforms, database, agents, and LightRAG memory — ready to build.",
    images: [
      {
        url: "/fractera-snipet.png",
        width: 1200,
        height: 630,
        alt: "Fractera — Open-Source Production AI Development Workspace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fractera — Open-Source Production AI Development Workspace",
    description:
      "Open-source. Your own server and live domain in seconds. Production AI development workspace with 5 platforms, database, agents, and LightRAG memory — ready to build.",
    images: ["/fractera-snipet.png"],
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

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Fractera',
  url: 'https://www.fractera.ai',
  logo: 'https://www.fractera.ai/fractera-logo.jpg',
  description:
    'Production AI Development Workspace. Ship features faster with fewer tokens using Claude Code, Codex, Gemini CLI, Qwen Code, and Kimi Code on your own server.',
  email: 'admin@fractera.ai',
  sameAs: ['https://www.fractera.ai'],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Fractera',
  url: 'https://www.fractera.ai',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
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
