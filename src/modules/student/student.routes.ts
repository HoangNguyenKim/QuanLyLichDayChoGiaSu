import { Router } from 'express';
import { validateRequest } from '../../common/middleware';
import { createStudentSchema, updateStudentSchema } from './student.dto';
import { studentController } from './student.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Quản lý học sinh
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID của học sinh
 *         fullName:
 *           type: string
 *           description: Họ và tên
 *         address:
 *           type: string
 *           nullable: true
 *           description: Địa chỉ
 *         apartmentFloor:
 *           type: string
 *           nullable: true
 *           description: Tầng/Căn hộ
 *         parentPhone:
 *           type: string
 *           nullable: true
 *           description: Số điện thoại phụ huynh
 *         note:
 *           type: string
 *           nullable: true
 *           description: Ghi chú
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         subjects:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               subject:
 *                 $ref: '#/components/schemas/Subject'
 *     CreateStudentInput:
 *       type: object
 *       required:
 *         - fullName
 *       properties:
 *         fullName:
 *           type: string
 *           minLength: 1
 *           description: Họ và tên học sinh
 *         address:
 *           type: string
 *           description: Địa chỉ
 *         apartmentFloor:
 *           type: string
 *           description: Tầng/Căn hộ
 *         parentPhone:
 *           type: string
 *           description: Số điện thoại phụ huynh
 *         note:
 *           type: string
 *           description: Ghi chú
 *         subjectIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: Danh sách ID môn học
 *     UpdateStudentInput:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *           minLength: 1
 *         address:
 *           type: string
 *         apartmentFloor:
 *           type: string
 *         parentPhone:
 *           type: string
 *         note:
 *           type: string
 *         subjectIds:
 *           type: array
 *           items:
 *             type: integer
 */

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Lấy danh sách học sinh
 *     description: Lấy danh sách học sinh có phân trang và tìm kiếm theo tên
 *     tags: [Students]
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
 *         description: Tìm kiếm theo họ tên
 *     responses:
 *       200:
 *         description: Danh sách học sinh
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
 *                     $ref: '#/components/schemas/Student'
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
router.get('/', studentController.getAll);

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Lấy thông tin học sinh theo ID
 *     description: Lấy chi tiết thông tin của một học sinh bao gồm các môn học và lịch dạy
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của học sinh
 *     responses:
 *       200:
 *         description: Thông tin chi tiết học sinh
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       404:
 *         description: Không tìm thấy học sinh
 */
router.get('/:id', studentController.getById);

/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Tạo học sinh mới
 *     description: Tạo một học sinh mới với thông tin cơ bản và danh sách môn học (tùy chọn)
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStudentInput'
 *     responses:
 *       201:
 *         description: Tạo học sinh thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/', validateRequest(createStudentSchema), studentController.create);

/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     summary: Cập nhật thông tin học sinh
 *     description: Cập nhật thông tin của một học sinh. Nếu cung cấp subjectIds, danh sách môn học sẽ được thay thế hoàn toàn.
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của học sinh
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStudentInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy học sinh
 */
router.put('/:id', validateRequest(updateStudentSchema), studentController.update);

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: Xóa học sinh
 *     description: Xóa một học sinh theo ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của học sinh
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
 *         description: Không tìm thấy học sinh
 */
router.delete('/:id', studentController.delete);

export default router;
