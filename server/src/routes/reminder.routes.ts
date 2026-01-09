import { FastifyInstance } from "fastify";
import { ReminderController } from "../controllers/ReminderController";
import { ensureAuthenticated } from "../middleware/ensureAuthenticated";

const reminderController = new ReminderController();

export async function reminderRoutes(app: FastifyInstance) {
  // Adicione o hook 'onRequest' para bloquear quem não tem login
  app.post("/", { onRequest: [ensureAuthenticated] }, reminderController.store);
}
