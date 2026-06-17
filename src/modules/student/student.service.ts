import { AppError } from '../../common/errors';
import { PaginationParams } from '../../common/types/pagination';
import { StudentRepository, studentRepository } from './student.repository';
import { CreateStudentDto, UpdateStudentDto } from './student.dto';

export class StudentService {
  constructor(private repository: StudentRepository) {}

  async getAll(params: PaginationParams) {
    return this.repository.findAll(params);
  }

  async getById(id: number) {
    const student = await this.repository.findById(id);
    if (!student) {
      throw AppError.notFound(`Không tìm thấy học sinh với ID: ${id}`);
    }
    return student;
  }

  async create(data: CreateStudentDto) {
    return this.repository.create(data);
  }

  async update(id: number, data: UpdateStudentDto) {
    await this.getById(id);
    return this.repository.update(id, data);
  }

  async delete(id: number) {
    await this.getById(id);
    return this.repository.delete(id);
  }

  async markPaid(id: number) {
    await this.getById(id);
    return this.repository.markPaid(id);
  }
}

export const studentService = new StudentService(studentRepository);
