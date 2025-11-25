import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from "http";
import path from 'path';

import { initializeSocket, notifyStudent } from './services/socket.js';


import authRouter from './routes/auth.route.js';
// import sync_db from './database/sync_db.js';
import updateStatusRouter from './routes/updatestatus.route.js';
import createLog from './routes/create_daily_logs.route.js';
import assignIntervention from './routes/assign-intervention.route.js';

dotenv.config();

// await sync_db();


const app = express();
const PORT = process.env.PORT || 3000;
const frontendUrl = process.env.FRONTENDURL||'http://localhost:8081';


const server = http.createServer(app);

const io = initializeSocket(server,frontendUrl);










app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRouter);
app.use('/api/updatestatus', updateStatusRouter);
app.use('/api/createlog', createLog);
app.use('/api/assign-intervention', assignIntervention);
app.use('/api/complete-remedial',updateStatusRouter );



app.get('/',(req,res)=>{
    res.send("BACKEND API");
});




server.listen(PORT,()=>{
console.log(`Server is running on port ${PORT}`)
});

