import { DataTypes } from "sequelize";
import sequelize from "../connect_db.js";
import Student from "./students.model.js";
import DailyLog from "./daily_logs.model.js";
import students from "./students.model.js";
import daily_logs from "./daily_logs.model.js";

const interventions = sequelize.define("interventions", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.STRING, // e.g., "Call", "Message", "Meeting"
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  }}
, {
   timestamps: false
});

// Associations
interventions.belongsTo(students, { foreignKey: "studentId" });
students.hasMany(interventions, { foreignKey: "studentId" });

interventions.belongsTo(daily_logs, { foreignKey: "dailyLogId", allowNull: true });
daily_logs.hasMany(interventions, { foreignKey: "dailyLogId" });

export default interventions;
