import { NextApiRequest, NextApiResponse } from "next";
import { generateId } from "@/utils/generateId";
import { createRoom } from "@/utils/store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { duration } = JSON.parse(req.body);
  const roomId = generateId();
  createRoom(roomId, duration);
  res.status(200).json({ roomId });
}
