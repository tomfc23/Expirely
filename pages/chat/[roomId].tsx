import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { generateUserName } from "@/utils/userName";

export default function ChatRoom() {
  const router = useRouter();
  const { roomId } = router.query;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("chat-username");
      if (saved) return saved;
      const name = generateUserName();
      sessionStorage.setItem("chat-username", name);
      return name;
    }
    return "User";
  });
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId || typeof roomId !== "string") return;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${protocol}://${window.location.host}/api/socket/${roomId}`);
    ws.current = socket;

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "init") {
        setMessages(msg.messages);
        setExpiresAt(msg.expiresAt);
      } else if (msg.type === "message") {
        setMessages((prev) => [...prev, msg]);
      } else if (msg.type === "expired") {
        setExpired(true);
        socket.close();
      }
    };

    socket.onclose = () => {
      console.log("Socket closed");
    };

    return () => socket.close();
  }, [roomId]);

  const sendMessage = () => {
    if (!input.trim() || !ws.current) return;
    ws.current.send(JSON.stringify({ name: username, text: input }));
    setInput("");
  };

  const formatCountdown = () => {
    if (!expiresAt) return "";
    const remaining = Math.max(0, expiresAt - Date.now());
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (expired) {
    return <div className="p-8 text-center">This room has expired.</div>;
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="text-sm text-right mb-2 text-gray-500">Expires in: {formatCountdown()}</div>
      <div className="border h-64 overflow-y-auto p-2 mb-2">
        {messages.map((msg, i) => (
          <div key={i} className="mb-1">
            <strong>{msg.name}: </strong>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="border flex-grow p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4">Send</button>
      </div>
    </div>
  );
}
