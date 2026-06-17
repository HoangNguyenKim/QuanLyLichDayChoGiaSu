import { Router } from 'express';
import { dashboardController } from './dashboard.controller';

const router = Router();

/**
 * @swagger
 * /api/dashboard/today:
 *   get:
 *     summary: Lấy lịch dạy hôm nay
 *     description: Trả về danh sách và số lượng các buổi dạy trong ngày hôm nay, sắp xếp theo giờ bắt đầu.
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Danh sách lịch dạy hôm nay
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
 *                     count:
 *                       type: integer
 *                       description: Số buổi dạy hôm nay
 *                       example: 3
 *                     schedules:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           date:
 *                             type: string
 *                             format: date
 *                           startTime:
 *                             type: string
 *                             example: "08:00"
 *                           endTime:
 *                             type: string
 *                             example: "10:00"
 *                           location:
 *                             type: string
 *                           mode:
 *                             type: string
 *                             enum: [ONLINE, OFFLINE]
 *                           completed:
 *                             type: boolean
 *                           student:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               fullName:
 *                                 type: string
 *                           subject:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               name:
 *                                 type: string
 */
router.get('/today', dashboardController.getTodaySchedules);

/**
 * @swagger
 * /api/dashboard/upcoming:
 *   get:
 *     summary: Lấy lịch dạy sắp tới
 *     description: Trả về danh sách các buổi dạy sắp tới từ ngày mai, giới hạn 20 kết quả.
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *           minimum: 1
 *           maximum: 30
 *         description: Số ngày tới cần lấy lịch (mặc định 7)
 *     responses:
 *       200:
 *         description: Danh sách lịch dạy sắp tới
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       date:
 *                         type: string
 *                         format: date
 *                       startTime:
 *                         type: string
 *                       endTime:
 *                         type: string
 *                       location:
 *                         type: string
 *                       mode:
 *                         type: string
 *                         enum: [ONLINE, OFFLINE]
 *                       completed:
 *                         type: boolean
 *                       student:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           fullName:
 *                             type: string
 *                       subject:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 */
router.get('/upcoming', dashboardController.getUpcomingSchedules);

/**
 * @swagger
 * /api/dashboard/income/weekly:
 *   get:
 *     summary: Thống kê thu nhập tuần
 *     description: Tính tổng thu nhập thực tế và số buổi đã hoàn thành trong tuần hiện tại (Thứ Hai - Chủ Nhật).
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Thống kê thu nhập tuần
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
 *                     totalIncome:
 *                       type: number
 *                       description: Tổng thu nhập thực tế trong tuần
 *                       example: 1500000
 *                     completedSessions:
 *                       type: integer
 *                       description: Số buổi đã hoàn thành
 *                       example: 5
 *                     startDate:
 *                       type: string
 *                       format: date
 *                       description: Ngày bắt đầu tuần
 *                       example: "2026-06-15"
 *                     endDate:
 *                       type: string
 *                       format: date
 *                       description: Ngày kết thúc tuần
 *                       example: "2026-06-21"
 */
router.get('/income/weekly', dashboardController.getWeeklyIncome);

/**
 * @swagger
 * /api/dashboard/income/monthly:
 *   get:
 *     summary: Thống kê thu nhập tháng
 *     description: Tính tổng thu nhập thực tế và số buổi đã hoàn thành trong tháng hiện tại.
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Thống kê thu nhập tháng
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
 *                     totalIncome:
 *                       type: number
 *                       description: Tổng thu nhập thực tế trong tháng
 *                       example: 6000000
 *                     completedSessions:
 *                       type: integer
 *                       description: Số buổi đã hoàn thành
 *                       example: 20
 *                     month:
 *                       type: integer
 *                       description: Tháng hiện tại (1-12)
 *                       example: 6
 *                     year:
 *                       type: integer
 *                       description: Năm hiện tại
 *                       example: 2026
 */
router.get('/income/monthly', dashboardController.getMonthlyIncome);

/**
 * @swagger
 * /api/dashboard/income/stats:
 *   get:
 *     summary: Thống kê thu nhập (Tuần, Tháng, Tổng)
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/income/stats', dashboardController.getIncomeStats);

/**
 * @swagger
 * /api/dashboard/todos:
 *   get:
 *     summary: Lấy danh sách việc cần làm hôm nay
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/todos', dashboardController.getTodayTodos);

export default router;
