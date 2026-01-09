import { app } from "./app";
import { prisma } from "./libs/prisma";
import { StartWhatsAppSession } from "./services/WbotServices/StartWhatsAppSession";
import { CheckPendingRemindersService } from "./services/ReminderServices/CheckPendingRemindersService";

const start = async () => {
  try {
    // 1. Inicia o Servidor HTTP
    await app.listen({ port: 3333 });
    console.log("🚀 Server running on http://localhost:3333");

    // 2. Lógica de Inicialização do WhatsApp (Multi-usuário)
    console.log("🔌 Buscando conexões existentes...");

    // Busca TODOS os whatsapps que deveriam estar conectados
    // (Não criamos mais nada automático aqui, pois falta o userId)
    const whatsapps = await prisma.whatsapp.findMany({
      where: { status: { not: "DISCONNECTED" } }, // Opcional: só tenta reconectar os que não estavam deslogados
    });

    if (whatsapps.length > 0) {
      console.log(`🔌 Encontradas ${whatsapps.length} conexões para iniciar.`);
      for (const wpp of whatsapps) {
        StartWhatsAppSession(wpp.id);
      }
    } else {
      console.log("⚠️ Nenhuma conexão WhatsApp ativa encontrada no banco.");
    }

    // 3. Inicia o Scheduler
    console.log("⏰ Scheduler service started.");
    setInterval(CheckPendingRemindersService, 60000);
  } catch (err) {
    console.error("❌ Fatal Error during startup:", err);
    process.exit(1);
  }
};

start();
