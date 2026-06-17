import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sseController } from './sse.controller';

const prisma = new PrismaClient();

export class NotificationService {
  public startCronJob() {
    // Run every minute
    cron.schedule('* * * * *', async () => {
      try {
        await this.checkUpcomingSchedules();
      } catch (error) {
        console.error('Error running notification cron job:', error);
      }
    });
    console.log('Notification cron job started');
  }

  private async checkUpcomingSchedules() {
    const now = new Date();
    // Get schedules for today and tomorrow
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 2);

    const schedules = await prisma.schedule.findMany({
      where: {
        completed: false,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        student: true,
        subject: true,
      },
    });

    for (const schedule of schedules) {
      if (!schedule.startTime) continue;
      
      const [hours, minutes] = schedule.startTime.split(':').map(Number);
      const scheduleTime = new Date(schedule.date);
      scheduleTime.setHours(hours, minutes, 0, 0);

      const diffMs = scheduleTime.getTime() - now.getTime();
      if (diffMs <= 0) continue; // Already passed or happening now

      const diffMinutes = Math.floor(diffMs / 60000);

      // Notify 30 minutes before
      if (diffMinutes <= 30 && !schedule.notified30Min) {
        this.notify(schedule, 30);
        await prisma.schedule.update({ where: { id: schedule.id }, data: { notified30Min: true } });
      }
      // Notify 1 hour before
      else if (diffMinutes <= 60 && diffMinutes > 30 && !schedule.notified1Hour) {
        this.notify(schedule, 60);
        await prisma.schedule.update({ where: { id: schedule.id }, data: { notified1Hour: true } });
      }
      // Notify 1 day before
      else if (diffMinutes <= 1440 && diffMinutes > 60 && !schedule.notified1Day) {
        this.notify(schedule, 1440);
        await prisma.schedule.update({ where: { id: schedule.id }, data: { notified1Day: true } });
      }
    }
  }

  private notify(schedule: any, minutesBefore: number) {
    let timeText = '';
    if (minutesBefore === 30) timeText = '30 phút';
    else if (minutesBefore === 60) timeText = '1 giờ';
    else if (minutesBefore === 1440) timeText = '1 ngày';

    const message = `Sắp tới giờ dạy: Môn ${schedule.subject.name} cho ${schedule.student.fullName} lúc ${schedule.startTime} (còn ${timeText}).`;
    
    sseController.broadcast('reminder', {
      scheduleId: schedule.id,
      message,
    });
  }
}

export const notificationService = new NotificationService();
