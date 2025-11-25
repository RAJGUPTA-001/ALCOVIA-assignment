
import express from 'express';
import { create_daily_log } from '../controllers/create_daily_logs.controller.js';

const router=express.Router();
router.post('/', create_daily_log);

export default router;