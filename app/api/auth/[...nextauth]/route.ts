// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Import konfigurasi dari lib

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// --- TAMBAHAN PENTING ---
// Kita harus meng-export kembali authOptions dari sini
// agar file lain (seperti api/users/route.ts) bisa menemukannya.
export { authOptions };