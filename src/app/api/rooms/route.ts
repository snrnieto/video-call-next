import { NextResponse } from 'next/server'
import { RoomService } from '@/services/room.service'
import { RoomFilters, RoomStatus } from '@/models/room'

const roomService = new RoomService()

// GET /api/rooms
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filters: RoomFilters = {}

    if (searchParams.has('status')) {
      filters.status = searchParams.get('status') as RoomStatus
    }
    if (searchParams.has('userAPeerId')) {
      filters.userAPeerId = searchParams.get('userAPeerId')!
    }
    if (searchParams.has('userBPeerId')) {
      filters.userBPeerId = searchParams.get('userBPeerId')!
    }

    const rooms = await roomService.getRooms(filters)
    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
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

    const room = await roomService.createRoom({ userAPeerId })
    return NextResponse.json(room)
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
} 