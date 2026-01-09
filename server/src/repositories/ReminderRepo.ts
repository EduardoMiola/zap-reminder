import { Prisma } from "@prisma/client";
import { prisma } from "../libs/prisma";
interface CreateReminderDTO {
  content: string;
  phone: string;
  targetDate: Date;
  isSent: boolean;
  userId: string; 
}

export class ReminderRepository {
  async create(data: CreateReminderDTO) {
    const reminder = await prisma.reminder.create({
      data: {
        content: data.content,
        phone: data.phone,
        targetDate: data.targetDate,
        isSent: data.isSent,
        user: { connect: { id: data.userId } }, 
      },
    });
    return reminder;
  }

  // Busca todos os pendentes (método que o Scheduler usa)
  async findAllPending() {
    return await prisma.reminder.findMany({
      where: {
        isSent: false,
        targetDate: { lte: new Date() }, // Menor ou igual a agora
      },
    });
  }

  // O MÉTODO QUE ESTAVA FALTANDO:
  async markAsSent(id: string) {
    return await prisma.reminder.update({
      where: { id },
      data: { isSent: true },
    });
  }
}
