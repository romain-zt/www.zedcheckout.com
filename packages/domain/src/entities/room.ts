export type RoomStatus = 'active' | 'disabled';

export interface Room {
  id: string;
  tenantId: string;
  name: string;
  bookableWithoutResource: boolean;
  status: RoomStatus;
  createdAt: Date;
}
