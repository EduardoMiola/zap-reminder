import { ReminderRepository } from "../../repositories/ReminderRepo";

export class ListRemindersService {
  constructor(private reminderRepository: ReminderRepository) {}

  async execute(userId: string) {
    const reminders = await this.reminderRepository.findAllByUserId(userId);
    return reminders;
  }
}
