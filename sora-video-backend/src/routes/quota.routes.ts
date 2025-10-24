import { Router } from 'express';
import * as quotaController from '../controllers/quota.controller.js';

const router = Router();

// Get current user's quota
router.get('/', quotaController.getUserQuota);

// Check if user can create a video
router.get('/check', quotaController.checkQuota);

export default router;
