
import express from 'express';
import { updateStatus } from '../controllers/updatestatus.controller.js';

const router=express.Router();
router.post('/', updateStatus);

export default router;