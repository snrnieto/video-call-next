import { NextResponse } from 'next/server'
import { RoomService } from '@/services/room.service'

const roomService = new RoomService()

// POST /api/rooms/[id]/join
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { userBPeerId } = body

    if (!userBPeerId) {
      return NextResponse.json(
        { error: 'userBPeerId is required' },
        { status: 400 }
      )
    }

    const room = await roomService.joinRoom(params.id, userBPeerId)
    return NextResponse.json(room)
  } catch (error) {
    console.error('Error joining room:', error)
    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    )
  }
} 