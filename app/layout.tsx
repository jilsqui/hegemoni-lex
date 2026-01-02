import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "./providers";
import Navbar from "@/components/Navbar"; // <--- 1. Import ini

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hegemoni Lex",
  description: "Portal Edukasi Hukum Indonesia",
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
          
          {children}
          
        </NextAuthProvider>
      </body>
    </html>
  );
}