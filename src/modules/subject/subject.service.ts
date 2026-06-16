import { AppError } from '../../common/errors';
import { SubjectRepository, subjectRepository } from './subject.repository';
import { CreateSubjectDto, UpdateSubjectDto } from './subject.dto';

export class SubjectService {
  constructor(private repository: SubjectRepository) {}

  async getAll() {
    return this.repository.findAll();
  }

  async getById(id: number) {
    const subject = await this.repository.findById(id);
    if (!subject) {
      throw AppError.notFound(`Không tìm thấy môn học với ID: ${id}`);
    }
    return subject;
  }

  async create(data: CreateSubjectDto) {
    return this.repository.create(data);
  }

  async update(id: number, data: UpdateSubjectDto) {
    await this.getById(id);
    return this.repository.update(id, data);
  }

  async delete(id: number) {
    await this.getById(id);
    return this.repository.delete(id);
  }
}

export const subjectService = new SubjectService(subjectRepository);
