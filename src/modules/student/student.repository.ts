import prisma from '../../config/database';
import { PaginationParams } from '../../common/types/pagination';
import { getSkip } from '../../common/utils/pagination';
import { CreateStudentDto, UpdateStudentDto } from './student.dto';

export class StudentRepository {
  async findAll(params: PaginationParams) {
    const { search } = params;
    const skip = getSkip(params);

    const where = search
      ? { fullName: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [data, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          subjects: {
            include: {
              subject: true,
            },
          },
          schedules: {
            where: {
              completed: true,
              isPaid: false,
            },
          },
        },
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.student.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: number) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
        schedules: true,
      },
    });
  }

  async create(data: CreateStudentDto) {
    const { subjectIds, ...studentData } = data;

    return prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: studentData,
      });

      if (subjectIds && subjectIds.length > 0) {
        await tx.studentSubject.createMany({
          data: subjectIds.map((subjectId) => ({
            studentId: student.id,
            subjectId,
          })),
        });
      }

      return tx.student.findUnique({
        where: { id: student.id },
        include: {
          subjects: {
            include: {
              subject: true,
            },
          },
        },
      });
    });
  }

  async update(id: number, data: UpdateStudentDto) {
    const { subjectIds, ...studentData } = data;

    return prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id },
        data: studentData,
      });

      if (subjectIds !== undefined) {
        await tx.studentSubject.deleteMany({
          where: { studentId: id },
        });

        if (subjectIds.length > 0) {
          await tx.studentSubject.createMany({
            data: subjectIds.map((subjectId) => ({
              studentId: id,
              subjectId,
            })),
          });
        }
      }

      return tx.student.findUnique({
        where: { id },
        include: {
          subjects: {
            include: {
              subject: true,
            },
          },
        },
      });
    });
  }

  async delete(id: number) {
    return prisma.student.delete({
      where: { id },
    });
  }

  async markPaid(studentId: number) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error('Học sinh không tồn tại');
    }

    const schedulesToUpdate = await prisma.schedule.findMany({
      where: {
        studentId,
        completed: true,
        isPaid: false,
      },
    });

    if (schedulesToUpdate.length === 0 && student.previousUnpaidSessions === 0) {
      return { count: 0 };
    }

    const updatedSchedules = await prisma.$transaction(async (tx) => {
      const schedules = await Promise.all(
        schedulesToUpdate.map((schedule) =>
          tx.schedule.update({
            where: { id: schedule.id },
            data: {
              isPaid: true,
              actualIncome: schedule.estimatedIncome,
            },
          })
        )
      );

      if (student.previousUnpaidSessions > 0) {
        await tx.student.update({
          where: { id: studentId },
          data: { previousUnpaidSessions: 0 },
        });
      }

      return schedules;
    });

    return { count: updatedSchedules.length + student.previousUnpaidSessions };
  }
}

export const studentRepository = new StudentRepository();
