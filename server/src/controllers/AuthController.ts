import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { hash, compare } from "bcryptjs"; // Importante: npm install bcryptjs
import { prisma } from "../libs/prisma";
import { AppError } from "../utils/AppError";

export class AuthController {
  // --- ROTA DE CRIAÇÃO DE CONTA (REGISTER) ---
  async register(request: FastifyRequest, reply: FastifyReply) {
    // 1. Validação dos dados que chegam do Front
    const registerSchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6), // Senha mínima de 6 dígitos
    });

    const { name, email, password } = registerSchema.parse(request.body);

    // 2. Verifica se já existe alguém com esse email
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new AppError("User already exists.");
    }

    // 3. Criptografa a senha (Nunca salve senha pura!)
    const password_hash = await hash(password, 6);

    // 4. Cria o usuário no banco
    await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
      },
    });

    return reply.status(201).send({ message: "User created successfully." });
  }

  // --- ROTA DE LOGIN (SESSIONS) ---
  async authenticate(request: FastifyRequest, reply: FastifyReply) {
    const authSchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const { email, password } = authSchema.parse(request.body);

    // Busca usuário
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new AppError("Invalid credentials.", 401);
    }

    // Compara senha enviada com a hash do banco
    const doesPasswordMatch = await compare(password, user.password_hash);

    if (!doesPasswordMatch) {
      throw new AppError("Invalid credentials.", 401);
    }

    // Gera o Token JWT
    const token = await reply.jwtSign(
      { name: user.name },
      { sign: { sub: user.id, expiresIn: "7d" } }
    );

    return reply.status(200).send({ token });
  }
}
