interface Room {
  id: string;
  expiresAt: number;
  users: string[];
  messages: { name: string; text: string }[];
}

const rooms = new Map<string, Room>();

export function createRoom(id: string, durationMinutes: number) {
  const expiresAt = Date.now() + durationMinutes * 60 * 1000;
  const room: Room = { id, expiresAt, users: [], messages: [] };
  rooms.set(id, room);
}

export function getRoom(id: string) {
  const room = rooms.get(id);
  if (!room) return null;
  if (Date.now() > room.expiresAt) {
    rooms.delete(id);
    return null;
  }
  return room;
}

export function addUserToRoom(id: string, user: string): boolean {
  const room = getRoom(id);
  if (!room) return false;
  if (room.users.length >= 2) return false;
  room.users.push(user);
  return true;
}

export function addMessage(id: string, name: string, text: string) {
  const room = getRoom(id);
  if (!room) return;
  room.messages.push({ name, text });
}

export function getMessages(id: string) {
  const room = getRoom(id);
  return room?.messages ?? [];
}
