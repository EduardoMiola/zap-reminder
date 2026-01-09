import { FastifyInstance } from "fastify";
import { WhatsappController } from "../controllers/WhatsappController";

const whatsappController = new WhatsappController();

export async function whatsappRoutes(app: FastifyInstance) {
  app.get("/status", whatsappController.getStatus);
}
