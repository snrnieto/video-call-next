export const RoomStatus = {
  WAITING: 'WAITING',
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED'
} as const

export type RoomStatus = typeof RoomStatus[keyof typeof RoomStatus]

export interface Room {
  id: string
  createdAt: Date
  status: RoomStatus
  userAPeerId: string
  userBPeerId: string | null
}

export interface CreateRoomDTO {
  userAPeerId: string
}

export interface UpdateRoomDTO {
  userBPeerId?: string
  status?: RoomStatus
}

export interface RoomFilters {
  status?: RoomStatus
  userAPeerId?: string
  userBPeerId?: string
} 