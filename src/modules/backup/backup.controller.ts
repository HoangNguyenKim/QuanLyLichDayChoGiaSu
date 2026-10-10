import { Request, Response, NextFunction } from 'express';
import { backupService } from './backup.service';

export class BackupController {
  createBackup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const path = await backupService.createBackup('manual');
      res.json({ success: true, data: { path } });
    } catch (error) {
      next(error);
    }
  };

  restoreBackup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filename } = req.body;
      if (!filename) throw new Error('Filename is required');
      await backupService.restoreBackup(filename);
      res.json({ success: true, message: 'Database restored successfully' });
    } catch (error) {
      next(error);
    }
  };

  getBackups = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const backups = backupService.getBackups();
      res.json({ success: true, data: backups });
    } catch (error) {
      next(error);
    }
  };
}

export const backupController = new BackupController();
