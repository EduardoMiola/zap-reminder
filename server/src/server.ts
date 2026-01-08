import fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

// Import our new services
import { connectToWhatsApp } from "./services/whatsapp.js";
import { startScheduler } from "./services/scheduler.js";

const prisma = new PrismaClient();
const app = fastify();

app.register(cors, { origin: "*" });

app.get("/", () => {
  return { message: "Server ta funcionando!" };
});

app
  .listen({ port: 3333 })
  .then(() => {
    console.log("Server rodando na porta 3333");
  })
  .catch((err) => {
    console.error("Erro ao iniciar o servidor:", err);
    process.exit(1);
  });

app.post("/reminders", async (request) => {
  const bodySchema = z.object({
    content: z.string(),
    phone: z.string(),
    date: z.string().datetime(),
  });

  const { content, phone, date } = bodySchema.parse(request.body);

  const reminder = await prisma.reminder.create({
    data: {
      content,
      phone,
      targetDate: new Date(date),
    },
  });

  return reminder;
});

// STARTUP LOGIC
const start = async () => {
  try {
    // 1. Start HTTP Server
    await app.listen({ port: 3333 });
    console.log("HTTP Server running on http://localhost:3333");

    // 2. Connect to WhatsApp
    await connectToWhatsApp();

    // 3. Start the Cron Job/Scheduler
    startScheduler();
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
