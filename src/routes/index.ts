import { Router } from 'express';
import studentRoutes from '../modules/student/student.routes';
import subjectRoutes from '../modules/subject/subject.routes';
import scheduleRoutes from '../modules/schedule/schedule.routes';
import dashboardRoutes from '../modules/dashboard/dashboard.routes';
import reminderRoutes from '../modules/reminder/reminder.routes';
import notificationRoutes from '../modules/notification/notification.routes';

const router = Router();

router.use('/students', studentRoutes);
router.use('/subjects', subjectRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reminders', reminderRoutes);
router.use('/notifications', notificationRoutes);

export default router;
