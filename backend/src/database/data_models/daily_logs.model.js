import { DataTypes } from "sequelize";
import sequelize from "../connect_db.js";
import students from "./students.model.js";

const daily_logs = sequelize.define("daily_logs", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  focusTime: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: false,
  },
  quizScore: {
    type: DataTypes.INTEGER, // percentage or score
    allowNull: false,
  }
}, {
   timestamps: false
});

// Associations
daily_logs.belongsTo(students, { foreignKey: "studentId" });
students.hasMany(daily_logs, { foreignKey: "studentId" });

export default daily_logs;
