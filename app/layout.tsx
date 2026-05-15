import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { NextAuthProvider } from "./providers";
import Navbar from "@/components/Navbar"; // <--- 1. Import ini
import VisitorTracker from "@/components/VisitorTracker";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "HEGEMONI LEX",
    template: "%s | HEGEMONI LEX",
  },
  description: "Platform literasi hukum dan kebijakan publik; Bertumbuh dan Berdampak",
  keywords: [
    "hukum Indonesia", "edukasi hukum", "artikel hukum", "opini hukum",
    "hukum pidana", "hukum perdata", "legislasi", "HAM",
    "Hegemoni Lex", "portal hukum", "literasi hukum",
    "analisis hukum", "ketenagakerjaan", "bisnis hukum",
    "kebijakan publik"
  ],
  authors: [{ name: "Hegemoni Lex", url: "https://hegemonilex.com" }],
  creator: "Hegemoni Lex",
  publisher: "Hegemoni Lex",
  metadataBase: new URL("https://hegemonilex.com"),
  alternates: {
    canonical: "https://hegemonilex.com",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://hegemonilex.com",
    siteName: "HEGEMONI LEX",
    title: "HEGEMONI LEX",
    description: "Platform literasi hukum dan kebijakan publik; Bertumbuh dan Berdampak",
    images: [{ url: "/logohl.png", width: 512, height: 512, alt: "HEGEMONI LEX Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HEGEMONI LEX",
    description: "Platform literasi hukum dan kebijakan publik; Bertumbuh dan Berdampak",
    images: ["/logohl.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Akan diisi setelah Google Search Console setup
    // google: "KODE_VERIFIKASI_GOOGLE",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <NextAuthProvider>
          <Navbar /> {/* <--- 2. Pasang di sini agar muncul di semua halaman */}
          <VisitorTracker />
          
          {children}
          
        </NextAuthProvider>
      </body>
    </html>
  );
}
