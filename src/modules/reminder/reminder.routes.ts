import { Router } from 'express';
import { reminderController } from './reminder.controller';
import { validateRequest } from '../../common/middleware';
import { createReminderSchema, updateReminderSchema } from './reminder.dto';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Reminder:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         scheduleId:
 *           type: integer
 *           example: 5
 *         remindBeforeMinutes:
 *           type: integer
 *           description: Số phút nhắc trước buổi dạy
 *           example: 30
 *         enabled:
 *           type: boolean
 *           description: Trạng thái bật/tắt nhắc nhở
 *           example: true
 *         schedule:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             date:
 *               type: string
 *               format: date
 *             startTime:
 *               type: string
 *             endTime:
 *               type: string
 *             location:
 *               type: string
 *             mode:
 *               type: string
 *               enum: [ONLINE, OFFLINE]
 *             completed:
 *               type: boolean
 *             student:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 fullName:
 *                   type: string
 *             subject:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *     CreateReminder:
 *       type: object
 *       required:
 *         - scheduleId
 *         - remindBeforeMinutes
 *       properties:
 *         scheduleId:
 *           type: integer
 *           description: ID của lịch dạy
 *           example: 5
 *         remindBeforeMinutes:
 *           type: integer
 *           description: Số phút nhắc trước buổi dạy (tối thiểu 1)
 *           minimum: 1
 *           example: 30
 *         enabled:
 *           type: boolean
 *           description: Trạng thái bật/tắt (mặc định true)
 *           default: true
 *     UpdateReminder:
 *       type: object
 *       properties:
 *         remindBeforeMinutes:
 *           type: integer
 *           description: Số phút nhắc trước buổi dạy
 *           minimum: 1
 *           example: 15
 *         enabled:
 *           type: boolean
 *           description: Trạng thái bật/tắt
 *           example: false
 */

/**
 * @swagger
 * /api/reminders/active:
 *   get:
 *     summary: Lấy nhắc nhở đang hoạt động
 *     description: Trả về danh sách nhắc nhở đang bật cho các buổi dạy hôm nay chưa hoàn thành.
 *     tags: [Reminders]
 *     responses:
 *       200:
 *         description: Danh sách nhắc nhở đang hoạt động
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reminder'
 */
router.get('/active', reminderController.getActiveReminders);

/**
 * @swagger
 * /api/reminders:
 *   get:
 *     summary: Lấy danh sách nhắc nhở
 *     description: Trả về tất cả nhắc nhở, có thể lọc theo scheduleId.
 *     tags: [Reminders]
 *     parameters:
 *       - in: query
 *         name: scheduleId
 *         schema:
 *           type: integer
 *         description: Lọc theo ID lịch dạy
 *     responses:
 *       200:
 *         description: Danh sách nhắc nhở
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reminder'
 */
router.get('/', reminderController.getAll);

/**
 * @swagger
 * /api/reminders/{id}:
 *   get:
 *     summary: Lấy chi tiết nhắc nhở
 *     description: Trả về thông tin chi tiết của một nhắc nhở theo ID.
 *     tags: [Reminders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của nhắc nhở
 *     responses:
 *       200:
 *         description: Chi tiết nhắc nhở
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Reminder'
 *       404:
 *         description: Không tìm thấy nhắc nhở
 */
router.get('/:id', reminderController.getById);

/**
 * @swagger
 * /api/reminders:
 *   post:
 *     summary: Tạo nhắc nhở mới
 *     description: Tạo một nhắc nhở mới cho lịch dạy.
 *     tags: [Reminders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReminder'
 *     responses:
 *       201:
 *         description: Nhắc nhở được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Reminder'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy lịch dạy
 */
router.post('/', validateRequest(createReminderSchema), reminderController.create);

/**
 * @swagger
 * /api/reminders/{id}:
 *   put:
 *     summary: Cập nhật nhắc nhở
 *     description: Cập nhật thông tin nhắc nhở theo ID.
 *     tags: [Reminders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của nhắc nhở
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReminder'
 *     responses:
 *       200:
 *         description: Nhắc nhở được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Reminder'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy nhắc nhở
 */
router.put('/:id', validateRequest(updateReminderSchema), reminderController.update);

/**
 * @swagger
 * /api/reminders/{id}:
 *   delete:
 *     summary: Xóa nhắc nhở
 *     description: Xóa một nhắc nhở theo ID.
 *     tags: [Reminders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của nhắc nhở
 *     responses:
 *       200:
 *         description: Xóa nhắc nhở thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Đã xóa nhắc nhở thành công
 *       404:
 *         description: Không tìm thấy nhắc nhở
 */
router.delete('/:id', reminderController.delete);

export default router;
