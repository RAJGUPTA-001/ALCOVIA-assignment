import students from "../database/data_models/students.model.js";



export const updateStatusfunc = async (Id, status) => {
  return await students.update(
    { status },
    { where: { Id } }
  );
};

const updateStatus = async (req, res) => {
  try {
    const { email, status } = req.body;

    const result = await students.update(
      { status },
      { where: { email } }
    );

    if (result[0] === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Status updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { updateStatus };

