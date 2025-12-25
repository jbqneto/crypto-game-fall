export type CreateRoomInput = {
  owner: string;
  roomName: string;
  isOpen: boolean;
};

export type Room = {
  id: string;
  owner: string;
  roomName: string;
  isOpen: boolean;
  createdAt: number;
};

const STORAGE_KEY = "cfa_rooms_v1";

function loadRooms(): Room[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Room[]) : [];
  } catch {
    return [];
  }
}

function saveRooms(rooms: Room[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
}

function generateRoomId(): string {
  // Short, URL-friendly id
  return Math.random().toString(36).slice(2, 10);
}

export const RoomService = {
  async createRoom(input: CreateRoomInput): Promise<Room> {
    // In the future: call backend API and return server-created room
    const rooms = loadRooms();

    const room: Room = {
      id: generateRoomId(),
      owner: input.owner,
      roomName: input.roomName.trim(),
      isOpen: input.isOpen,
      createdAt: Date.now(),
    };

    rooms.unshift(room);
    saveRooms(rooms);

    return room;
  },

  async listRooms(): Promise<Room[]> {
    // In the future: call backend API
    return loadRooms();
  },

  async getRoom(roomId: string): Promise<Room | null> {
    const rooms = loadRooms();
    return rooms.find((r) => r.id === roomId) ?? null;
  },
};
