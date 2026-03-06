// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Ambil semua daftar user (Hanya ADMIN)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ users });

    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Gagal mengambil data user" }, { status: 500 });
    }
}
