import { Router } from 'express';
import { sseController } from './sse.controller';

const router = Router();

// Streaming endpoint
router.get('/stream', sseController.stream);

export default router;
