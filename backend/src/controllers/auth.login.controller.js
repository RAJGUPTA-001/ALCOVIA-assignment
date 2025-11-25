import students from "../database/data_models/students.model.js";


const getStudentByemail = async (req, res) => {
  try {
    const email = req.body.email;
    const student = await students.findOne({
    where: { email }
  });
  console.log(student);
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { getStudentByemail};



