import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }    from 'next-auth/next'
import { authOptions }         from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = context.params.id;
  await prisma.prompt.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({}, { status: 204 });
}