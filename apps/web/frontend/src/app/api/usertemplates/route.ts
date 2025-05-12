// app/api/usertemplates/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }        from 'next-auth'
import { authOptions }             from '@/lib/auth'
import { prisma }                  from '@/lib/prisma'



export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // pull the `industry` query-param, if any
  const { searchParams } = new URL(req.url);
  const industryParam = searchParams.get("industry") || undefined;
  console.log(`industryParam: ${industryParam}`)
  if (industryParam) {
    // --- Mode 1: flat list for a given industry ---
    const recs = await prisma.userCreatedTemplate.findMany({
      where: {
        userId:   session.user.id,
        industry: encodeURIComponent(industryParam),
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(recs, { status: 200 })
  }

  // --- Mode 2: no param → group all templates by industry ---
  const allTemplates = await prisma.userCreatedTemplate.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  const groupedObj = allTemplates.reduce<Record<string, typeof allTemplates>>(
    (acc, tmpl) => {
      if (!acc[tmpl.industry]) acc[tmpl.industry] = []
      acc[tmpl.industry].push(tmpl)
      return acc
    },
    {}
  )

  const groupedArray = Object.entries(groupedObj).map(
    ([industry, templates]) => ({ industry, templates })
  )

  return NextResponse.json(groupedArray, { status: 200 })
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
