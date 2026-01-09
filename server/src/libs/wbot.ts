import { WASocket } from "@whiskeysockets/baileys";
import { AppError } from "../utils/AppError";

export type Session = WASocket & {
  id?: string;
};

const sessions: Session[] = [];

export const getWbot = (whatsappId: string): Session => {
  const session = sessions.find((s) => s.id === whatsappId);
  if (!session) {
    throw new AppError("WhatsApp session not initialized", 404);
  }
  return session;
};

export const initWbot = (whatsappId: string, wsocket: Session) => {
  wsocket.id = whatsappId;
  const index = sessions.findIndex((s) => s.id === whatsappId);
  if (index !== -1) {
    sessions[index] = wsocket;
  } else {
    sessions.push(wsocket);
  }
};
