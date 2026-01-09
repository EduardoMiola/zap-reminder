import { PrismaClient } from "@prisma/client";

// Padrão Singleton para o Prisma
export const prisma = new PrismaClient();
