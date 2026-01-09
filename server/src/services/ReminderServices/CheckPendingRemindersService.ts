import { getWbot } from "../../libs/wbot";
import { prisma } from "../../libs/prisma";
import { ReminderRepository } from "../../repositories/ReminderRepo";

export const CheckPendingRemindersService = async () => {
  const reminderRepo = new ReminderRepository();
  const pendingReminders = await reminderRepo.findAllPending();

  if (pendingReminders.length === 0) return;

  const defaultWhatsapp = await prisma.whatsapp.findFirst({
    where: { isDefault: true },
  });

  if (!defaultWhatsapp || defaultWhatsapp.status !== "CONNECTED") {
    console.log("⚠️ WhatsApp desconectado. Pulando checagem.");
    return;
  }

  const wbot = getWbot(defaultWhatsapp.id);

  for (const reminder of pendingReminders) {
    // Verifica se já passou da hora
    if (new Date(reminder.targetDate) <= new Date()) {
      try {
        // 1. Limpeza do número (Tira caracteres especiais)
        let phone = reminder.phone.replace(/\D/g, "");

        // 2. Adiciona o 55 se não tiver
        if (!phone.startsWith("55")) {
          phone = `55${phone}`;
        }

        // 3. O PULO DO GATO: Verifica o JID real no WhatsApp
        // Isso resolve o problema do 9º dígito automaticamente
        const mResults = await wbot.onWhatsApp(phone);

        if (mResults && mResults.length > 0 && mResults[0].exists) {
          const result = mResults[0];
          // Envia para o JID correto devolvido pelo WhatsApp (result.jid)
          await wbot.sendMessage(result.jid, { text: reminder.content });

          await reminderRepo.markAsSent(reminder.id);
          console.log(`✅ Enviado para ${result.jid} (ID Real)`);
        } else {
          console.error(`❌ Número não tem WhatsApp: ${phone}`);
          // Opcional: Marcar como falha no banco para não tentar de novo
        }
      } catch (err) {
        console.error(`❌ Erro ao enviar lembrete ${reminder.id}`, err);
      }
    }
  }
};
