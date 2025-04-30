import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }    from 'next-auth/next'
import { authOptions }         from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { original, rewritten, mode, targetModel } = await req.json()

  const prompt = await prisma.prompt.create({
    data: {
      userId:           session.user.id,
      originalPrompt:   original,
      rewrittenPrompt:  rewritten,
      mode,
      targetModel,
    }
  })

  return NextResponse.json(prompt, { status: 201 })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const history = await prisma.prompt.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(history)
}
