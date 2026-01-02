import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Mengupdate tipe 'Session' agar mengenali 'role' dan 'id'
   */
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  /**
   * Mengupdate tipe 'User' agar mengenali 'role'
   */
  interface User {
    role: string
  }
}

declare module "next-auth/jwt" {
  /**
   * Mengupdate tipe 'JWT' (Token) agar mengenali 'role'
   */
  interface JWT {
    role: string
  }
}