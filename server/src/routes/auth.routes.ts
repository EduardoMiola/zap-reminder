import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/AuthController";

const authController = new AuthController();

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", authController.register);

  app.post("/sessions", authController.authenticate);
}
