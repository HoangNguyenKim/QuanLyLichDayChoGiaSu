import prisma from '../../config/database';
import { PaginationParams } from '../../common/types/pagination';
import { getSkip } from '../../common/utils/pagination';
import { isTimeOverlapping, isTimeClose } from '../../common/utils/dateUtils';
import { CreateScheduleDto, UpdateScheduleDto } from './schedule.dto';

interface ScheduleFilterParams extends PaginationParams {
  studentId?: number;
  subjectId?: number;
  completed?: boolean;
  date?: string;
}

export class ScheduleRepository {
  async findAll(params: ScheduleFilterParams) {
    const { search, studentId, subjectId, completed, date } = params;
    const skip = getSkip(params);

    const where: any = {};

    if (studentId) {
      where.studentId = studentId;
    }

    if (subjectId) {
      where.subjectId = subjectId;
    }

    if (completed !== undefined) {
      where.completed = completed;
    }

    if (date) {
      where.date = new Date(date);
    }

    if (search) {
      where.student = {
        fullName: { contains: search, mode: 'insensitive' },
      };
    }

    const [data, total] = await Promise.all([
      prisma.schedule.findMany({
        where,
        include: {
          student: true,
          subject: true,
        },
        skip,
        take: params.limit,
        orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
      }),
      prisma.schedule.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: number) {
    return prisma.schedule.findUnique({
      where: { id },
      include: {
        student: true,
        subject: true,
        reminders: true,
      },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    return prisma.schedule.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        student: true,
        subject: true,
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findConflicting(
    date: Date,
    startTime: string,
    endTime: string,
    excludeId?: number,
  ) {
    const schedulesOnDate = await prisma.schedule.findMany({
      where: {
        date,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      include: {
        student: true,
        subject: true,
      },
    });

    return schedulesOnDate.filter((schedule) =>
      isTimeOverlapping(startTime, endTime, schedule.startTime, schedule.endTime),
    );
  }

  async findCloseSchedules(
    date: Date,
    startTime: string,
    endTime: string,
    excludeId?: number,
    thresholdMinutes = 15
  ) {
    const schedulesOnDate = await prisma.schedule.findMany({
      where: {
        date,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      include: {
        student: true,
        subject: true,
      },
    });

    return schedulesOnDate.filter((schedule) =>
      isTimeClose(startTime, endTime, schedule.startTime, schedule.endTime, thresholdMinutes)
    );
  }

  async create(data: CreateScheduleDto) {
    const { date, ...rest } = data;

    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
    });

    return prisma.schedule.create({
      data: {
        ...rest,
        date: new Date(date),
        estimatedIncome: data.estimatedIncome ?? student?.tuitionFeePerSession ?? 0,
      },
      include: {
        student: true,
        subject: true,
      },
    });
  }

  async update(id: number, data: UpdateScheduleDto) {
    const { date, ...rest } = data;

    const updateData: any = { ...rest };
    if (date !== undefined) {
      updateData.date = new Date(date);
    }

    return prisma.schedule.update({
      where: { id },
      data: updateData,
      include: {
        student: true,
        subject: true,
      },
    });
  }

  async delete(id: number) {
    return prisma.schedule.delete({
      where: { id },
    });
  }

  async markCompleted(id: number, completed: boolean) {
    return prisma.schedule.update({
      where: { id },
      data: { completed },
      include: {
        student: true,
        subject: true,
      },
    });
  }

  async markLessonPrepared(id: number, lessonPrepared: boolean) {
    return prisma.schedule.update({
      where: { id },
      data: { lessonPrepared },
      include: {
        student: true,
        subject: true,
      },
    });
  }
}

export const scheduleRepository = new ScheduleRepository();
