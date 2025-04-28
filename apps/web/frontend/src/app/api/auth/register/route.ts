import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const prisma = new PrismaClient();

  const exists = await prisma.user.findUnique({ where:{ email } });
  if (exists) return NextResponse.json({ error: "User exists" }, { status: 400 });

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, passwordHash: hash } });
  return NextResponse.json({ ok: true });
}
