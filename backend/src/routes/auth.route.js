
import express from 'express';

import  {getStudentByemail}  from '../controllers/auth.login.controller.js';
const router=express.Router();
router.post('/login', getStudentByemail);

export default router;