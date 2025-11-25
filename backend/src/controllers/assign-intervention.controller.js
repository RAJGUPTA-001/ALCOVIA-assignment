
import interventions from "../database/data_models/interventions.model.js";
import { notifyStudent } from "../services/socket.js";
import { updateStatusfunc } from "./updatestatus.controller.js";




const  assign_intervention = async (req, res) => {
  try {
    const { TASK,  studentId ,dailyLogId  } = req.body;
    console.log(req.body);

    await interventions.create({
        type: "Mentor Review-TASK",
        description: TASK,
        studentId:parseInt(studentId), 
        dailyLogId:parseInt(dailyLogId)
    });
    notifyStudent(studentId,'intervention_assigned',{
      message: 'TASK ASSIGNED',
  status: 'remedial',
  remedial_task:TASK

    });

    updateStatusfunc(studentId,"task-assigned")

    

    // res.json({ message: "Intervention updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { assign_intervention };

