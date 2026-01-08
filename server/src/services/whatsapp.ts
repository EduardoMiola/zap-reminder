import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import type { WASocket } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";

// Variable to hold the active socket connection
let socket: WASocket | null = null;

export async function connectToWhatsApp() {
  // 1. Load/Create credentials in a folder named "auth_info_baileys"
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  socket = makeWASocket({
    auth: state,
    printQRInTerminal: false, // We will handle QR manually to make it look better
  });

  // 2. Handle Connection Events (QR Code, Connect, Disconnect)
  socket.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    // If we need to scan, show QR
    if (qr) {
      console.log("\nScan this QR Code to login:");
      qrcode.generate(qr, { small: true });
    }

    // If connection closed, handle reconnect
    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log(
        "Connection closed due to ",
        lastDisconnect?.error,
        ", reconnecting ",
        shouldReconnect
      );

      // Recursively reconnect if not logged out
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("✅ WhatsApp Connected Successfully!");
    }
  });

  // 3. Save credentials whenever they update
  socket.ev.on("creds.update", saveCreds);
}

// 4. Export a function to send text messages
export async function sendWhatsAppMessage(to: string, message: string) {
  if (!socket) {
    throw new Error("WhatsApp is not connected.");
  }

  // Baileys requires the ID in format: "countrycode+number@s.whatsapp.net"
  const id = `${to}@s.whatsapp.net`;

  await socket.sendMessage(id, { text: message });
  console.log(`Message sent to ${to}`);
}
