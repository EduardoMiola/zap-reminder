import fastify from "fastify";
import cors from "@fastify/cors";
import { ZodError } from "zod";
import { AppError } from "./utils/AppError";
import { routes } from "./routes"; // Importa do index.ts das rotas

export const app = fastify();

// 1. Plugins Globais
app.register(cors, { origin: "*" });

// 2. Rotas
app.register(routes);

// 3. Global Error Handler (Centraliza o tratamento de erros)
app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation error.",
      issues: error.format(),
    });
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      message: error.message,
    });
  }

  // Erro desconhecido (Loga no servidor mas não mostra detalhes pro usuário)
  console.error(error);
  return reply.status(500).send({ message: "Internal Server Error" });
});
