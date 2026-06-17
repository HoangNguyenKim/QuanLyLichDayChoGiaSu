import prisma from '../../config/database';
import {
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
} from '../../common/utils/dateUtils';

export class DashboardService {
  /**
   * Get all schedules for today, ordered by start time.
   */
  async getTodaySchedules() {
    const startOfDay = getStartOfDay();
    const endOfDay = getEndOfDay();

    const schedules = await prisma.schedule.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        student: true,
        subject: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return {
      total: schedules.length,
      completed: schedules.filter(s => s.completed).length,
      schedules,
    };
  }

  /**
   * Get upcoming schedules from tomorrow up to the specified number of days.
   * Default: next 7 days. Limited to 20 results.
   */
  async getUpcomingSchedules(days: number = 7) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfTomorrow = getStartOfDay(tomorrow);

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    const endOfRange = getEndOfDay(endDate);

    const schedules = await prisma.schedule.findMany({
      where: {
        date: {
          gte: startOfTomorrow,
          lte: endOfRange,
        },
      },
      include: {
        student: true,
        subject: true,
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
      take: 20,
    });

    return schedules;
  }

  /**
   * Calculate total income and completed sessions for the current week (Monday-Sunday).
   */
  async getWeeklyIncome() {
    const startOfWeek = getStartOfWeek();
    const endOfWeek = getEndOfWeek();

    const result = await prisma.schedule.aggregate({
      where: {
        completed: true,
        date: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      _sum: {
        actualIncome: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      totalIncome: result._sum.actualIncome ?? 0,
      completedSessions: result._count.id,
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: endOfWeek.toISOString().split('T')[0],
    };
  }

  /**
   * Calculate total income and completed sessions for the current month.
   */
  async getMonthlyIncome() {
    const now = new Date();
    const startOfMonth = getStartOfMonth();
    const endOfMonth = getEndOfMonth();

    const result = await prisma.schedule.aggregate({
      where: {
        completed: true,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        actualIncome: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      totalIncome: result._sum.actualIncome ?? 0,
      completedSessions: result._count.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };
  }

  /**
   * Get income stats: weekly, monthly, and total
   */
  async getIncomeStats() {
    const startOfWeek = getStartOfWeek();
    const endOfWeek = getEndOfWeek();
    const startOfMonth = getStartOfMonth();
    const endOfMonth = getEndOfMonth();

    const [weeklyAll, weeklyPaid, monthlyAll, monthlyPaid, totalAll, totalPaid, preparedLessons, notPreparedLessons] = await Promise.all([
      prisma.schedule.aggregate({
        where: { date: { gte: startOfWeek, lte: endOfWeek } },
        _sum: { estimatedIncome: true },
      }),
      prisma.schedule.aggregate({
        where: { isPaid: true, date: { gte: startOfWeek, lte: endOfWeek } },
        _sum: { actualIncome: true },
      }),
      prisma.schedule.aggregate({
        where: { date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { estimatedIncome: true },
      }),
      prisma.schedule.aggregate({
        where: { isPaid: true, date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { actualIncome: true },
      }),
      prisma.schedule.aggregate({
        _sum: { estimatedIncome: true },
      }),
      prisma.schedule.aggregate({
        where: { isPaid: true },
        _sum: { actualIncome: true },
      }),
      prisma.schedule.count({
        where: { completed: false, lessonPrepared: true },
      }),
      prisma.schedule.count({
        where: { completed: false, lessonPrepared: false },
      }),
    ]);

    return {
      weekly: {
        actual: weeklyPaid._sum.actualIncome ?? 0,
        estimated: weeklyAll._sum.estimatedIncome ?? 0,
      },
      monthly: {
        actual: monthlyPaid._sum.actualIncome ?? 0,
        estimated: monthlyAll._sum.estimatedIncome ?? 0,
      },
      total: {
        actual: totalPaid._sum.actualIncome ?? 0,
        estimated: totalAll._sum.estimatedIncome ?? 0,
      },
      lessons: {
        prepared: preparedLessons,
        notPrepared: notPreparedLessons,
        total: preparedLessons + notPreparedLessons
      }
    };
  }

  /**
   * Get today's to-do list (formatting schedules as tasks)
   */
  async getTodayTodos() {
    const todayData = await this.getTodaySchedules();
    const todos = todayData.schedules.map(schedule => {
      const isPrepared = schedule.lessonPrepared;
      const title = `${schedule.startTime} dạy ${schedule.subject.name} cho ${schedule.student.fullName}`;
      return {
        id: schedule.id,
        scheduleId: schedule.id,
        title,
        status: isPrepared ? 'Đã soạn bài' : 'Chưa soạn bài',
        isPrepared,
        completed: schedule.completed
      };
    });
    return todos;
  }
}

export const dashboardService = new DashboardService();
