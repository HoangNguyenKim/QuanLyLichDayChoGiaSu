import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../../common/types/response';
import { SubjectService, subjectService } from './subject.service';

export class SubjectController {
  constructor(private service: SubjectService) {}

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subjects = await this.service.getAll();
      res.json(successResponse(subjects));
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const subject = await this.service.getById(id);
      res.json(successResponse(subject));
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subject = await this.service.create(req.body);
      res.status(201).json(successResponse(subject));
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const subject = await this.service.update(id, req.body);
      res.json(successResponse(subject));
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.service.delete(id);
      res.json(successResponse({ message: 'Xóa môn học thành công' }));
    } catch (error) {
      next(error);
    }
  };
}

export const subjectController = new SubjectController(subjectService);
