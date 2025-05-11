// app/api/usertemplates/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }        from 'next-auth/next'
import { authOptions }             from '@/lib/auth'
import { prisma }                  from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const recs = await prisma.userCreatedTemplate.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(recs)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { industry, templates } = await req.json() as {
    industry: string
    templates: { topic: string; user_prompt: string }[]
  }

  const created = []
  for (const { topic, user_prompt } of templates) {
    const rec = await prisma.userCreatedTemplate.create({
      data: {
        userId:   session.user.id,
        industry,
        topic,
        prompt:   user_prompt
      }
    })
    created.push(rec)
  }
  return NextResponse.json(created, { status: 201 })
}
