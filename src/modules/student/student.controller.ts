import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../../common/types/response';
import { getPaginationParams, getPaginationMeta } from '../../common/utils/pagination';
import { StudentService, studentService } from './student.service';

export class StudentController {
  constructor(private service: StudentService) {}

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = getPaginationParams(req.query);
      const { data, total } = await this.service.getAll(params);
      const meta = getPaginationMeta(total, params);
      res.json(successResponse(data, meta));
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const student = await this.service.getById(id);
      res.json(successResponse(student));
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const student = await this.service.create(req.body);
      res.status(201).json(successResponse(student));
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const student = await this.service.update(id, req.body);
      res.json(successResponse(student));
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.service.delete(id);
      res.json(successResponse({ message: 'Xóa học sinh thành công' }));
    } catch (error) {
      next(error);
    }
  };
}

export const studentController = new StudentController(studentService);
