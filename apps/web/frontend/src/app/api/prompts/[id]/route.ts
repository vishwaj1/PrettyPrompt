// src/app/api/prompts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }    from 'next-auth/next'
import { authOptions }         from '@/lib/auth'
import { PrismaClient }        from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string }}   // <— allow Next.js to infer proper context type
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.prompt.deleteMany({
    where: { id: context.params.id, userId: session.user.id }
  })

  return NextResponse.json(null, { status: 204 })
}
