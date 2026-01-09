import { FastifyInstance } from "fastify";
import { reminderRoutes } from "./reminder.routes";
import { whatsappRoutes } from "./whatsapp.routes"; // <--- Importe

export async function routes(app: FastifyInstance) {
  app.register(reminderRoutes, { prefix: "reminders" });
  app.register(whatsappRoutes, { prefix: "whatsapp" }); // <--- Registre
}
