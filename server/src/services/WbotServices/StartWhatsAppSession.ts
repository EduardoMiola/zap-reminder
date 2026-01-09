import makeWASocket, {
  DisconnectReason,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import path from "path";
import { Boom } from "@hapi/boom";
import { prisma } from "../../libs/prisma";
import { initWbot } from "../../libs/wbot";
import qrcode from "qrcode-terminal"; // Importa a lib de desenhar QR
import pino from "pino"; // Para silenciar os logs chatos

export const StartWhatsAppSession = async (whatsappId: string) => {
  const whatsapp = await prisma.whatsapp.findUnique({
    where: { id: whatsappId },
  });
  if (!whatsapp) return;

  await prisma.whatsapp.update({
    where: { id: whatsappId },
    data: { status: "STARTING" },
  });

  const authPath = path.resolve(process.cwd(), `auth_info_${whatsappId}`);
  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  const wsocket = makeWASocket({
    // 1. Desliga o aviso de deprecated
    printQRInTerminal: false,
    // 2. Silencia os logs (só mostra erros graves)
    logger: pino({ level: "error" }) as any,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(
        state.keys,
        pino({ level: "error" }) as any
      ),
    },
    browser: ["Zap Reminder", "Chrome", "1.0.0"],
  });

  wsocket.ev.on("creds.update", saveCreds);

  wsocket.ev.on(
    "connection.update",
    async ({ connection, lastDisconnect, qr }) => {
      // 1. SE TIVER QR CODE, SALVA NO BANCO IMEDIATAMENTE
      if (qr) {
        console.log("📡 QR Code gerado! Atualizando banco...");

        await prisma.whatsapp.update({
          where: { id: whatsappId },
          data: {
            status: "QRCODE", // Define o status específico
            qrcode: qr, // Salva a string longa do QR
          },
        });
      }

      // 2. SE CONECTOU, LIMPA O QR CODE
      if (connection === "open") {
        console.log("✅ Conexão estabelecida!");

        await prisma.whatsapp.update({
          where: { id: whatsappId },
          data: {
            status: "CONNECTED",
            qrcode: null, // Limpa para não aparecer mais
            retries: 0,
          },
        });

        initWbot(whatsappId, wsocket as any);
      }

      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        console.log(
          `🔴 Conexão caiu (Status: ${statusCode}). Reconectando: ${shouldReconnect}`
        );

        if (shouldReconnect) {
          StartWhatsAppSession(whatsappId);
        } else {
          await prisma.whatsapp.update({
            where: { id: whatsappId },
            data: { status: "DISCONNECTED", qrcode: "" },
          });
          // Opcional: Apagar a pasta de auth se for logout real
        }
      }
    }
  );

  return wsocket;
};
