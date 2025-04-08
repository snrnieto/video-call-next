import { Room, RoomStatus } from '@/models/room'

export class RoomClient {
  async findWaitingRoom(): Promise<Room | null> {
    const response = await fetch('/api/rooms?status=WAITING')
    const rooms: Room[] = await response.json()
    return rooms.find(room => room.userAPeerId) || null
  }

  async createRoom(userAPeerId: string): Promise<Room> {
    const response = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAPeerId })
    })
    return response.json()
  }

  async joinRoom(roomId: string, userBPeerId: string): Promise<Room> {
    const response = await fetch(`/api/rooms/${roomId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userBPeerId,
        status: RoomStatus.ACTIVE
      })
    })
    return response.json()
  }

  async updateRoomStatus(roomId: string, status: RoomStatus): Promise<Room> {
    const response = await fetch(`/api/rooms/${roomId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    return response.json()
  }
} 