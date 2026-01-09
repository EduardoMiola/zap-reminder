import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { ReminderRepository } from "../repositories/ReminderRepo"; 
import { CreateReminderService } from "../services/ReminderServices/CreateReminderService";
import { ListRemindersService } from "../services/ReminderServices/ListRemindersService";

export class ReminderController {
  async store(request: FastifyRequest, reply: FastifyReply) {
    // 1. Validação do Corpo
    const createBodySchema = z.object({
      content: z.string(),
      phone: z.string(),
      date: z.string().datetime(),
    });

    const { content, phone, date } = createBodySchema.parse(request.body);

    // 2. PEGAR O ID DO USUÁRIO DO TOKEN
    // O middleware ensureAuthenticated preenche o request.user
    const userId = request.user.sub;

    // 3. Instanciação
    const reminderRepository = new ReminderRepository();
    const createReminderService = new CreateReminderService(reminderRepository);

    // 4. Execução (Agora passando o userId)
    const reminder = await createReminderService.execute({
      content,
      phone,
      date,
      userId,
    });

    return reply.status(201).send(reminder);
  }

  async index(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub; // Pega o ID do token

    const reminderRepository = new ReminderRepository();
    const listRemindersService = new ListRemindersService(reminderRepository);

    const reminders = await listRemindersService.execute(userId);

    return reply.status(200).send(reminders);
  }
}
