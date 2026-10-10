import { Router } from 'express';
import { backupController } from './backup.controller';

const router = Router();

router.get('/', backupController.getBackups);
router.post('/create', backupController.createBackup);
router.post('/restore', backupController.restoreBackup);

export default router;
