import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const env = process.env.NODE_ENV ;
const dbHost = env ==="production" ?  process.env.DB_HOST : "localhost";
const dbName = process.env.DB_NAME ;
const password = process.env.DB_PASSWORD ;
const dbuser = process.env.DB_USER ;
const sequelize = new Sequelize(dbName, dbuser ,password, {
  host: dbHost,
  dialect: "mysql",
  logging: false,
});



(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection successful!");
    console.log
  } catch (err) {
    console.error("Unable to connect:", err);
  }
})();




export  default sequelize;
