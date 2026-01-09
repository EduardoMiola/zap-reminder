import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../libs/prisma";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import { AppError } from "../utils/AppError";

export class WhatsappController {
  // 1. BUSCAR STATUS (GET)
  async getStatus(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub; // Pega o ID do usuário logado

    const whatsapp = await prisma.whatsapp.findFirst({
      where: { userId }, // Busca só o WhatsApp desse usuário
    });

    if (!whatsapp) {
      return reply.send({ status: "DISCONNECTED", qrcode: null });
    }

    return reply.send({
      status: whatsapp.status,
      qrcode: whatsapp.qrcode,
      name: whatsapp.name,
    });
  }

  // 2. INICIAR SESSÃO (POST)
  async createSession(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub;

    // Verifica se já tem um criado
    let whatsapp = await prisma.whatsapp.findFirst({
      where: { userId },
    });

    // Se não tiver, cria no banco
    if (!whatsapp) {
      whatsapp = await prisma.whatsapp.create({
        data: {
          name: "My Whatsapp",
          status: "STARTING",
          isDefault: true,
          userId,
        },
      });
    } else {
      // Se já tiver, força o status para STARTING para tentar de novo
      whatsapp = await prisma.whatsapp.update({
        where: { id: whatsapp.id },
        data: { status: "STARTING" },
      });
    }

    // Chama o serviço do Baileys para rodar
    StartWhatsAppSession(whatsapp.id);

    return reply.send({ message: "Starting session..." });
  }

  // 3. DESCONECTAR (DELETE - Opcional, bom ter)
  async deleteSession(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub;

    // Na vida real aqui você chamaria wsocket.end() também
    // Mas vamos simplificar removendo do banco para resetar
    await prisma.whatsapp.deleteMany({
      where: { userId },
    });

    return reply.send({ message: "Session reset." });
  }
}
