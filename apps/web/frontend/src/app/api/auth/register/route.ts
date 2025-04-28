import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // Basic validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ detail: 'Invalid email address.' }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ detail: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ detail: 'Email already registered.' }, { status: 400 });
  }

  // Check password strength
  if (!isStrongPassword(password)) {
    return NextResponse.json(
      { detail: 'Password must be at least 6 characters and include a capital letter, a digit, and a special character.' },
      { status: 400 }
    );
  }

  // Hash password and create user
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, passwordHash },
  });

  return NextResponse.json({ success: true });
}

function isStrongPassword(password: string) {
  return /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password) && password.length >= 6;
}
