import { jsonResponse } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return jsonResponse({ error: "All fields are required" }, 400);
  }

  // Cek apakah email sudah terdaftar
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return jsonResponse({ error: "Email already registered" }, 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Simpan user baru
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  // Buat session ID untuk user baru
  const sessionId = crypto.randomUUID();

  return jsonResponse(
    { 
      message: "User registered", 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      } 
    },
    200,
    [{
      name: 'session-id',
      value: sessionId,
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    }]
  );
}