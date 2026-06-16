import { Router } from 'express';
import { validateRequest } from '../../common/middleware';
import { createScheduleSchema, updateScheduleSchema } from './schedule.dto';
import { scheduleController } from './schedule.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: Quản lý lịch dạy
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Schedule:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID của lịch dạy
 *         studentId:
 *           type: integer
 *           description: ID học sinh
 *         subjectId:
 *           type: integer
 *           description: ID môn học
 *         date:
 *           type: string
 *           format: date
 *           description: Ngày dạy (YYYY-MM-DD)
 *         startTime:
 *           type: string
 *           pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *           description: Giờ bắt đầu (HH:mm)
 *         endTime:
 *           type: string
 *           pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *           description: Giờ kết thúc (HH:mm)
 *         location:
 *           type: string
 *           nullable: true
 *           description: Địa điểm
 *         locationDetail:
 *           type: string
 *           nullable: true
 *           description: Chi tiết địa điểm
 *         mode:
 *           type: string
 *           enum: [ONLINE, OFFLINE]
 *           description: Hình thức dạy
 *         note:
 *           type: string
 *           nullable: true
 *           description: Ghi chú
 *         lessonPrepared:
 *           type: boolean
 *           description: Đã soạn bài chưa
 *         completed:
 *           type: boolean
 *           description: Đã hoàn thành chưa
 *         estimatedIncome:
 *           type: number
 *           description: Thu nhập dự kiến
 *         actualIncome:
 *           type: number
 *           description: Thu nhập thực tế
 *         teachingNote:
 *           type: string
 *           nullable: true
 *           description: Ghi chú giảng dạy
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         student:
 *           $ref: '#/components/schemas/Student'
 *         subject:
 *           $ref: '#/components/schemas/Subject'
 *     CreateScheduleInput:
 *       type: object
 *       required:
 *         - studentId
 *         - subjectId
 *         - date
 *         - startTime
 *         - endTime
 *       properties:
 *         studentId:
 *           type: integer
 *           description: ID học sinh
 *         subjectId:
 *           type: integer
 *           description: ID môn học
 *         date:
 *           type: string
 *           format: date
 *           description: Ngày dạy (YYYY-MM-DD)
 *         startTime:
 *           type: string
 *           description: Giờ bắt đầu (HH:mm)
 *         endTime:
 *           type: string
 *           description: Giờ kết thúc (HH:mm)
 *         location:
 *           type: string
 *           description: Địa điểm
 *         locationDetail:
 *           type: string
 *           description: Chi tiết địa điểm
 *         mode:
 *           type: string
 *           enum: [ONLINE, OFFLINE]
 *           default: OFFLINE
 *           description: Hình thức dạy
 *         note:
 *           type: string
 *           description: Ghi chú
 *         lessonPrepared:
 *           type: boolean
 *           default: false
 *           description: Đã soạn bài chưa
 *         estimatedIncome:
 *           type: number
 *           default: 0
 *           description: Thu nhập dự kiến
 *         actualIncome:
 *           type: number
 *           default: 0
 *           description: Thu nhập thực tế
 *         teachingNote:
 *           type: string
 *           description: Ghi chú giảng dạy
 *     UpdateScheduleInput:
 *       type: object
 *       properties:
 *         studentId:
 *           type: integer
 *         subjectId:
 *           type: integer
 *         date:
 *           type: string
 *           format: date
 *         startTime:
 *           type: string
 *         endTime:
 *           type: string
 *         location:
 *           type: string
 *         locationDetail:
 *           type: string
 *         mode:
 *           type: string
 *           enum: [ONLINE, OFFLINE]
 *         note:
 *           type: string
 *         lessonPrepared:
 *           type: boolean
 *         estimatedIncome:
 *           type: number
 *         actualIncome:
 *           type: number
 *         teachingNote:
 *           type: string
 */

/**
 * @swagger
 * /api/schedules/weekly:
 *   get:
 *     summary: Lấy lịch dạy theo tuần
 *     description: Lấy danh sách lịch dạy trong tuần. Nếu không truyền date, sẽ lấy tuần hiện tại.
 *     tags: [Schedules]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bất kỳ trong tuần cần xem (YYYY-MM-DD). Mặc định là hôm nay.
 *     responses:
 *       200:
 *         description: Danh sách lịch dạy trong tuần
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 */
router.get('/weekly', scheduleController.getWeekly);

/**
 * @swagger
 * /api/schedules/monthly:
 *   get:
 *     summary: Lấy lịch dạy theo tháng
 *     description: Lấy danh sách lịch dạy trong tháng. Nếu không truyền month/year, sẽ lấy tháng hiện tại.
 *     tags: [Schedules]
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Tháng (1-12). Mặc định là tháng hiện tại.
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Năm. Mặc định là năm hiện tại.
 *     responses:
 *       200:
 *         description: Danh sách lịch dạy trong tháng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 */
router.get('/monthly', scheduleController.getMonthly);

/**
 * @swagger
 * /api/schedules:
 *   get:
 *     summary: Lấy danh sách lịch dạy
 *     description: Lấy danh sách lịch dạy có phân trang và bộ lọc theo học sinh, môn học, trạng thái, ngày
 *     tags: [Schedules]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên học sinh
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: integer
 *         description: Lọc theo ID học sinh
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: integer
 *         description: Lọc theo ID môn học
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái hoàn thành
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Lọc theo ngày (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Danh sách lịch dạy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/', scheduleController.getAll);

/**
 * @swagger
 * /api/schedules/{id}:
 *   get:
 *     summary: Lấy thông tin lịch dạy theo ID
 *     description: Lấy chi tiết một lịch dạy bao gồm thông tin học sinh, môn học và nhắc nhở
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của lịch dạy
 *     responses:
 *       200:
 *         description: Thông tin chi tiết lịch dạy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Schedule'
 *       404:
 *         description: Không tìm thấy lịch dạy
 */
router.get('/:id', scheduleController.getById);

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: Tạo lịch dạy mới
 *     description: Tạo một lịch dạy mới. Nếu có lịch trùng giờ, hệ thống vẫn tạo nhưng trả về cảnh báo.
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateScheduleInput'
 *     responses:
 *       201:
 *         description: Tạo lịch dạy thành công (có thể kèm cảnh báo trùng giờ)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Schedule'
 *                 warning:
 *                   type: string
 *                   description: Thông báo cảnh báo nếu có lịch trùng giờ
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/', validateRequest(createScheduleSchema), scheduleController.create);

/**
 * @swagger
 * /api/schedules/{id}:
 *   put:
 *     summary: Cập nhật lịch dạy
 *     description: Cập nhật thông tin lịch dạy. Nếu thay đổi ngày/giờ và có trùng lịch, trả về cảnh báo.
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của lịch dạy
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateScheduleInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công (có thể kèm cảnh báo trùng giờ)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Schedule'
 *                 warning:
 *                   type: string
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy lịch dạy
 */
router.put('/:id', validateRequest(updateScheduleSchema), scheduleController.update);

/**
 * @swagger
 * /api/schedules/{id}:
 *   delete:
 *     summary: Xóa lịch dạy
 *     description: Xóa một lịch dạy theo ID
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của lịch dạy
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *       404:
 *         description: Không tìm thấy lịch dạy
 */
router.delete('/:id', scheduleController.delete);

/**
 * @swagger
 * /api/schedules/{id}/complete:
 *   patch:
 *     summary: Đánh dấu hoàn thành/chưa hoàn thành
 *     description: Toggle trạng thái hoàn thành của lịch dạy
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của lịch dạy
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Schedule'
 *       404:
 *         description: Không tìm thấy lịch dạy
 */
router.patch('/:id/complete', scheduleController.markCompleted);

/**
 * @swagger
 * /api/schedules/{id}/lesson-prepared:
 *   patch:
 *     summary: Đánh dấu đã soạn bài/chưa soạn bài
 *     description: Toggle trạng thái soạn bài của lịch dạy
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của lịch dạy
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Schedule'
 *       404:
 *         description: Không tìm thấy lịch dạy
 */
router.patch('/:id/lesson-prepared', scheduleController.markLessonPrepared);

export default router;
