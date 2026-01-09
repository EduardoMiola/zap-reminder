import { FastifyInstance } from "fastify";
import { WhatsappController } from "../controllers/WhatsappController";
import { ensureAuthenticated } from "../middleware/ensureAuthenticated";

const whatsappController = new WhatsappController();

export async function whatsappRoutes(app: FastifyInstance) {
  // Todas as rotas de WhatsApp exigem login
  app.addHook("onRequest", ensureAuthenticated);

  app.get("/status", whatsappController.getStatus);
  app.post("/", whatsappController.createSession); // <--- Botão "Start"
  app.delete("/", whatsappController.deleteSession); // <--- Botão "Reset"
}
