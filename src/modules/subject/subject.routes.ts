import { Router } from 'express';
import { validateRequest } from '../../common/middleware';
import { createSubjectSchema, updateSubjectSchema } from './subject.dto';
import { subjectController } from './subject.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Subjects
 *   description: Quản lý môn học
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Subject:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID của môn học
 *         name:
 *           type: string
 *           description: Tên môn học
 *     SubjectDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         students:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               student:
 *                 $ref: '#/components/schemas/Student'
 *     CreateSubjectInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           description: Tên môn học
 *     UpdateSubjectInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           description: Tên môn học
 */

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: Lấy danh sách tất cả môn học
 *     description: Lấy danh sách tất cả các môn học, sắp xếp theo tên
 *     tags: [Subjects]
 *     responses:
 *       200:
 *         description: Danh sách môn học
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
 *                     $ref: '#/components/schemas/Subject'
 */
router.get('/', subjectController.getAll);

/**
 * @swagger
 * /api/subjects/{id}:
 *   get:
 *     summary: Lấy thông tin môn học theo ID
 *     description: Lấy chi tiết một môn học bao gồm danh sách học sinh đang học
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của môn học
 *     responses:
 *       200:
 *         description: Thông tin chi tiết môn học
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SubjectDetail'
 *       404:
 *         description: Không tìm thấy môn học
 */
router.get('/:id', subjectController.getById);

/**
 * @swagger
 * /api/subjects:
 *   post:
 *     summary: Tạo môn học mới
 *     description: Tạo một môn học mới. Tên môn học phải là duy nhất.
 *     tags: [Subjects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubjectInput'
 *     responses:
 *       201:
 *         description: Tạo môn học thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Subject'
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/', validateRequest(createSubjectSchema), subjectController.create);

/**
 * @swagger
 * /api/subjects/{id}:
 *   put:
 *     summary: Cập nhật môn học
 *     description: Cập nhật tên của một môn học
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của môn học
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSubjectInput'
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
 *                   $ref: '#/components/schemas/Subject'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy môn học
 */
router.put('/:id', validateRequest(updateSubjectSchema), subjectController.update);

/**
 * @swagger
 * /api/subjects/{id}:
 *   delete:
 *     summary: Xóa môn học
 *     description: Xóa một môn học theo ID
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của môn học
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
 *         description: Không tìm thấy môn học
 */
router.delete('/:id', subjectController.delete);

export default router;
