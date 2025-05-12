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

  // 1) Fetch all the user’s templates
  const allTemplates = await prisma.userCreatedTemplate.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  // 2) Group them into an object { [industry]: [templates] }
  const groupedObj = allTemplates.reduce<Record<string, typeof allTemplates>>((acc, tmpl) => {
    acc[tmpl.industry] = acc[tmpl.industry] || []
    acc[tmpl.industry].push(tmpl)
    return acc
  }, {})

  // 3) Turn that object into an array of { industry, templates } entries
  const groupedArray = Object.entries(groupedObj).map(
    ([industry, templates]) => ({ industry, templates })
  )

  // If there were no templates at all, groupedArray will simply be []
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
