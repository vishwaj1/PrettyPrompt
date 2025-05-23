// src/app/api/auth/request-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { hash }                      from 'bcryptjs'
import nodemailer                    from 'nodemailer'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function randomOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    const code = randomOTP()
    const codeHash = await hash(code, 10)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.otp.create({
      data: { email, codeHash, expiresAt },
    })

    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: +process.env.SMTP_PORT!,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transport.sendMail({
      from: 'no-reply@prettyprompt.app',
      to: email,
      subject: 'Your PrettyPrompt signup code',
      text: `Your verification code is: ${code}\nThis code expires in 10 minutes.`,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error in request-otp:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
