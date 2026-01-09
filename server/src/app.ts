import fastify from "fastify";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt"; // <--- 1. IMPORTANTE: Importe isso
import { ZodError } from "zod";
import { AppError } from "./utils/AppError";
import { routes } from "./routes";

export const app = fastify();

// --- PLUGINS (Devem vir antes das rotas!) ---

app.register(cors, { origin: "*" });

// 2. IMPORTANTE: Registre o plugin JWT
app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "sua-senha-secreta-padrao",
});

// --- ROTAS ---
app.register(routes);

// --- TRATAMENTO DE ERROS ---
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

  console.error(error);
  return reply.status(500).send({ message: "Internal Server Error" });
});
