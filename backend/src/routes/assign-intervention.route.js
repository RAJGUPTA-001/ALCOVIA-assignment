
import express from 'express';
import { assign_intervention } from '../controllers/assign-intervention.controller.js';

const router=express.Router();
router.post('/', assign_intervention);

export default router;