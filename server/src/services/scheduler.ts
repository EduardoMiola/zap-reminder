import { PrismaClient } from "@prisma/client";
import { sendWhatsAppMessage } from "./whatsapp.js";

const prisma = new PrismaClient();

export function startScheduler() {
  console.log("⏰ Scheduler started...");

  // Run every 60 seconds (60000 ms)
  setInterval(async () => {
    const now = new Date();

    // 1. Find pending reminders whose time has passed
    const pendingReminders = await prisma.reminder.findMany({
      where: {
        isSent: false,
        targetDate: {
          lte: now, // "Less Than or Equal" to now
        },
      },
    });

    if (pendingReminders.length > 0) {
      console.log(`Found ${pendingReminders.length} reminders to send.`);
    }

    // 2. Process each reminder
    for (const reminder of pendingReminders) {
      try {
        // Send via Baileys
        await sendWhatsAppMessage(reminder.phone, reminder.content);

        // Update DB to mark as sent
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { isSent: true },
        });
      } catch (error) {
        console.error(`Failed to send reminder ${reminder.id}:`, error);
        // Optional: You could add a "retryCount" logic here later
      }
    }
  }, 60000); // 1 minute interval
}
