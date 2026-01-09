import { FastifyInstance } from "fastify";
import { ReminderController } from "../controllers/ReminderController";
import { ensureAuthenticated } from "../middleware/ensureAuthenticated";

const reminderController = new ReminderController();

export async function reminderRoutes(app: FastifyInstance) {
  // Criar (POST /reminders)
  app.post("/", { onRequest: [ensureAuthenticated] }, reminderController.store);

  // Listar (GET /reminders)
  app.get("/", { onRequest: [ensureAuthenticated] }, reminderController.index);
}