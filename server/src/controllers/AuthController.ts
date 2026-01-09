import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../libs/prisma";
import { z } from "zod";
import { hash, compare } from "bcryptjs";
import { AppError } from "../utils/AppError";

export class AuthController {
  // REGISTRO
  async register(request: FastifyRequest, reply: FastifyReply) {
    const registerSchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { name, email, password } = registerSchema.parse(request.body);

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      throw new AppError("User already exists.");
    }

    const password_hash = await hash(password, 6);

    await prisma.user.create({
      data: { name, email, password_hash },
    });

    return reply.status(201).send({ message: "User created successfully." });
  }

  // LOGIN
  async authenticate(request: FastifyRequest, reply: FastifyReply) {
    const authSchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const { email, password } = authSchema.parse(request.body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new AppError("Invalid credentials.", 401);
    }

    const doesPasswordMatch = await compare(password, user.password_hash);

    if (!doesPasswordMatch) {
      throw new AppError("Invalid credentials.", 401);
    }

    // Gera o Token JWT
    const token = await reply.jwtSign(
      { name: user.name }, // Payload público
      { sign: { sub: user.id, expiresIn: "7d" } } // Sub = ID do usuário
    );

    return reply.status(200).send({ token });
  }
}
