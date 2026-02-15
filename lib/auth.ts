// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  // 1. Konfigurasi Provider (Login pakai Email & Password)
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan Password wajib diisi");
        }

        // Cari user di database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Email tidak terdaftar");
        }

        // Cek Password
        // (Logika Tambahan: Cek apakah password di DB sudah di-hash atau belum)
        // Ini penting agar Admin lama (manual DB) dan User baru (Register) bisa login dua-duanya.
        let isPasswordValid = false;

        if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
            // Jika password terenkripsi (User dari Register / Admin baru)
            isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        } else {
            // Jika password masih polos (Admin lama dari input manual DB)
            isPasswordValid = credentials.password === user.password;
        }

        if (!isPasswordValid) {
          throw new Error("Password salah");
        }

        // Return data user jika sukses
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  
  // 2. Halaman Login Custom
  pages: {
    signIn: "/login",
  },

  // 3. Callback (Menyimpan Role ke Session)
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.id; // Menggunakan token.id dari JWT
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};