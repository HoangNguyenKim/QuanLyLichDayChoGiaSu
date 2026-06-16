import prisma from '../../config/database';
import { CreateSubjectDto, UpdateSubjectDto } from './subject.dto';

export class SubjectRepository {
  async findAll() {
    return prisma.subject.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number) {
    return prisma.subject.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            student: true,
          },
        },
      },
    });
  }

  async create(data: CreateSubjectDto) {
    return prisma.subject.create({
      data,
    });
  }

  async update(id: number, data: UpdateSubjectDto) {
    return prisma.subject.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return prisma.subject.delete({
      where: { id },
    });
  }
}

export const subjectRepository = new SubjectRepository();
