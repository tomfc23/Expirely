// pages/api/socket/[roomId].ts
import { WebSocketServer } from "ws";
import { getRoom, addUserToRoom, addMessage } from "@/utils/store";

const wss = new WebSocketServer({ noServer: true });

const clients = new Map();

export default function handler(req, res) {
  if (res.socket.server.wss) {
    res.end();
    return;
  }

  res.socket.server.wss = wss;

  res.socket.server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const roomId = url.pathname.split("/").pop();

    wss.handleUpgrade(req, socket, head, (ws) => {
      const room = getRoom(roomId!);
      if (!room) return ws.close();

      const user = `${Math.floor(Math.random() * 9000 + 1000)}`;
      const success = addUserToRoom(roomId!, user);
      if (!success) {
        ws.send(JSON.stringify({ type: "error", message: "Room full or expired." }));
        ws.close();
        return;
      }

      clients.set(ws, { roomId, user });

      ws.send(JSON.stringify({ type: "init", messages: room.messages, expiresAt: room.expiresAt }));

      ws.on("message", (msg) => {
        const { name, text } = JSON.parse(msg.toString());
        addMessage(roomId!, name, text);
        const payload = JSON.stringify({ type: "message", name, text });
        [...clients.entries()].forEach(([client, meta]) => {
          if (meta.roomId === roomId) client.send(payload);
        });
      });

      const interval = setInterval(() => {
        const room = getRoom(roomId!);
        if (!room) {
          ws.send(JSON.stringify({ type: "expired" }));
          ws.close();
          clearInterval(interval);
        }
      }, 5000);

      ws.on("close", () => {
        clearInterval(interval);
        clients.delete(ws);
      });
    });
  });

  res.end();
}
