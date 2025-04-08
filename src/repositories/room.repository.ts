import { prisma } from '@/lib/prisma'
import { Room, CreateRoomDTO, UpdateRoomDTO, RoomFilters } from '@/models/room'

export class RoomRepository {
  async findAll(filters?: RoomFilters): Promise<Room[]> {
    return prisma.room.findMany({
      where: filters,
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async findById(id: string): Promise<Room | null> {
    return prisma.room.findUnique({
      where: { id }
    })
  }

  async create(data: CreateRoomDTO): Promise<Room> {
    return prisma.room.create({
      data
    })
  }

  async update(id: string, data: UpdateRoomDTO): Promise<Room> {
    return prisma.room.update({
      where: { id },
      data
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.room.delete({
      where: { id }
    })
  }
} 