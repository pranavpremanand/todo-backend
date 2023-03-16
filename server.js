import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import router from "./routes/route.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const port = 5000;
app.listen(port, () => console.log(`Server is running on port:${port}`));

// Mongoose connection
mongoose.connect("mongodb://localhost:27017/ToDoApp");
const connection = mongoose.connection;
connection
  .on("connected", () => console.log("Database connected successfully!"))
  .on("error", () => console.log("Database connection failed!!!"));

app.use("/", router);

export default app;
