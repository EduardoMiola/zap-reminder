import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../libs/prisma";

export class WhatsappController {
  async getStatus(request: FastifyRequest, reply: FastifyReply) {
    // Busca o WhatsApp padrão
    const whatsapp = await prisma.whatsapp.findFirst({
      where: { isDefault: true },
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
}
