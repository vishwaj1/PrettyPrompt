// src/app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient }            from '@prisma/client'
import bcrypt                       from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const { email, password, code } = await req.json()

  // 1) Basic validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ detail: 'Invalid email address.' }, { status: 400 })
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ detail: 'Password must be at least 8 characters.' }, { status: 400 })
  }
  if (!code) {
    return NextResponse.json({ detail: 'OTP code is required.' }, { status: 400 })
  }

   // 3) Check if user already exists
   const existing = await prisma.user.findUnique({ where: { email } })
   if (existing) {
     return NextResponse.json({ detail: 'Email already registered.' }, { status: 400 })
   }

  // 2) Verify OTP
  const otpRecord = await prisma.otp.findFirst({ where: { email } })
  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    return NextResponse.json({ detail: 'OTP expired or not found.' }, { status: 400 })
  }
  const codeMatches = await bcrypt.compare(code, otpRecord.codeHash)
  if (!codeMatches) {
    return NextResponse.json({ detail: 'Invalid OTP code.' }, { status: 400 })
  }
  // consume it
  await prisma.otp.deleteMany({ where: { email } })

 

  // 4) Hash password & create user
  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: { email, passwordHash },
  })

  return NextResponse.json({ success: true })
}
