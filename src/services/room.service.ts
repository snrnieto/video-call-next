import { RoomRepository } from '@/repositories/room.repository'
import { Room, CreateRoomDTO, UpdateRoomDTO, RoomFilters, RoomStatus } from '@/models/room'

export class RoomService {
  private repository: RoomRepository

  constructor() {
    this.repository = new RoomRepository()
  }

  async getRooms(filters?: RoomFilters): Promise<Room[]> {
    return this.repository.findAll(filters)
  }

  async getRoomById(id: string): Promise<Room | null> {
    const room = await this.repository.findById(id)
    if (!room) {
      throw new Error('Room not found')
    }
    return room
  }

  async createRoom(data: CreateRoomDTO): Promise<Room> {
    return this.repository.create(data)
  }

  async updateRoom(id: string, data: UpdateRoomDTO): Promise<Room> {
    const room = await this.repository.findById(id)
    if (!room) {
      throw new Error('Room not found')
    }
    return this.repository.update(id, data)
  }

  async joinRoom(roomId: string, userBPeerId: string): Promise<Room> {
    const room = await this.repository.findById(roomId)
    if (!room) {
      throw new Error('Room not found')
    }
    if (room.status !== RoomStatus.WAITING) {
      throw new Error('Room is not available for joining')
    }
    return this.repository.update(roomId, {
      userBPeerId,
      status: RoomStatus.ACTIVE
    })
  }

  async leaveRoom(roomId: string): Promise<Room> {
    const room = await this.repository.findById(roomId)
    if (!room) {
      throw new Error('Room not found')
    }
    return this.repository.update(roomId, {
      status: RoomStatus.CLOSED
    })
  }

  async deleteRoom(id: string): Promise<void> {
    const room = await this.repository.findById(id)
    if (!room) {
      throw new Error('Room not found')
    }
    await this.repository.delete(id)
  }
} 