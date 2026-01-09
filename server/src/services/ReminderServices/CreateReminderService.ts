import { ReminderRepository } from "../../repositories/ReminderRepo";
import { AppError } from "../../utils/AppError";

interface IRequest {
  content: string;
  phone: string;
  date: string;
  userId: string;
}

export class CreateReminderService {
  constructor(private reminderRepository: ReminderRepository) {}

  async execute({ content, phone, date, userId }: IRequest) {
    const targetDate = new Date(date);

    if (targetDate < new Date()) {
      throw new AppError("You cannot schedule a reminder in the past.");
    }

    const cleanPhone = phone.replace(/\D/g, "");

    // Passamos o userId para o repositório
    const reminder = await this.reminderRepository.create({
      content,
      phone: cleanPhone,
      targetDate,
      isSent: false,
      userId, 
    });

    return reminder;
  }
}
