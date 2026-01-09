import { FastifyInstance } from "fastify";
import { reminderRoutes } from "./reminder.routes";
import { whatsappRoutes } from "./whatsapp.routes";
import { authRoutes } from "./auth.routes"; // <--- Importe aqui

export async function routes(app: FastifyInstance) {
  // Registra as rotas de Auth com o prefixo "/auth"
  app.register(authRoutes, { prefix: "auth" });

  app.register(reminderRoutes, { prefix: "reminders" });
  app.register(whatsappRoutes, { prefix: "whatsapp" });
}
