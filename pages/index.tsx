import { useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const [duration, setDuration] = useState("30");
  const router = useRouter();

  async function createRoom() {
    const res = await fetch("/api/create-room", {
      method: "POST",
      body: JSON.stringify({ duration: parseInt(duration) }),
    });
    const { roomId } = await res.json();
    const url = `/chat/${roomId}`;
    window.open(url, "_blank");
    alert("Room created. Copy link: " + window.location.origin + url);
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Expiring Chat</h1>
      <div className="flex gap-2">
        <select value={duration} onChange={(e) => setDuration(e.target.value)} className="p-2 border">
          <option value="30">30 Minutes</option>
          <option value="60">1 Hour</option>
          <option value="720">12 Hours</option>
        </select>
        <button onClick={createRoom} className="bg-blue-500 text-white px-4 py-2">Create Chatroom</button>
      </div>
    </main>
  );
}
