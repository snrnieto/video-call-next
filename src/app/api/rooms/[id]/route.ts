import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/rooms/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: params.id },
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    return NextResponse.json(room)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 })
  }
}

// PUT /api/rooms/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { userBPeerId, status } = body

    const room = await prisma.room.update({
      where: { id: params.id },
      data: {
        userBPeerId,
        status,
      },
    })

    return NextResponse.json(room)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 })
  }
}

// DELETE /api/rooms/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.room.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Room deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 })
  }
} 