import daily_logs from "../database/data_models/daily_logs.model.js";
import axios from "axios";
import dotenv, { config } from "dotenv";
dotenv.config();
import { updateStatusfunc } from "./updatestatus.controller.js";
const WEBHOOK_URL_N8N = process.env.WEBHOOK_URL_N8N;
const create_daily_log = async (req, res) => {
  try {
    const { focusTime, quizScore, studentId ,email  } = req.body;
    console.log(req.body);

    const newLog = await daily_logs.create({
      focusTime:parseInt(focusTime),
      quizScore:parseInt(quizScore),
      studentId:parseInt(studentId),
    });
    // console.log("New daily log created:", newLog);

    if (quizScore >= 7 && focusTime >= 60) {
     return res.json({ status: "On Track" });
    }
    else {
  // Step 1: Respond to frontend immediately
  res.json({ status: "Pending Mentor Review" });

  try {

    //TODO  : Also check for the databse update success
    await updateStatusfunc(studentId, "locked");
    const dailyLogId = newLog.dataValues.id;
    const response = await axios.post(WEBHOOK_URL_N8N, {
      studentId,
      focusTime,
      quizScore,
      email,
      dailyLogId
    });
//     
// 
// 
// 

    console.log("n8n webhook:", response.data);
    //  now done using https request in n8n
    // await updateStudentStatuslocked(email, "unlocked");

  } catch (err) {
    console.error("Database error/ N8N webhook error: ", err.message);
    
    await updateStudentStatuslocked(email, "unlocked");
  }

  return;
}


  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { create_daily_log };