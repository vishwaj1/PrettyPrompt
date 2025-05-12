// app/api/usertemplates/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }        from 'next-auth'
import { authOptions }             from '@/lib/auth'
import { prisma }                  from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const allTemplates = await prisma.userCreatedTemplate.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  // Group by industry
  const grouped = allTemplates.reduce<Record<string, typeof allTemplates>>((acc, tmpl) => {
    if (!acc[tmpl.industry]) acc[tmpl.industry] = []
    acc[tmpl.industry].push(tmpl)
    return acc
  }, {})

  return NextResponse.json(grouped, { status: 200 })
}


export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { industry, templates } = (await req.json()) as {
    industry: string
    templates: { topic: string; user_prompt: string }[]
  }

  const created = await Promise.all(
    templates.map(({ topic, user_prompt }) =>
      prisma.userCreatedTemplate.create({
        data: {
          userId:   session.user.id,
          industry,
          topic,
          prompt:   user_prompt,
        },
      })
    )
  )

  return NextResponse.json(created, { status: 201 })
}
