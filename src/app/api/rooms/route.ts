import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/rooms
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userAPeerId = searchParams.get('userAPeerId')
    const userBPeerId = searchParams.get('userBPeerId')

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (userAPeerId) {
      where.userAPeerId = userAPeerId
    }

    if (userBPeerId) {
      where.userBPeerId = userBPeerId
    }

    const rooms = await prisma.room.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}

// POST /api/rooms
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userAPeerId } = body

    if (!userAPeerId) {
      return NextResponse.json(
        { error: 'userAPeerId is required' },
        { status: 400 }
      )
    }

    const room = await prisma.room.create({
      data: {
        userAPeerId,
      },
    })

    return NextResponse.json(room)
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
} 