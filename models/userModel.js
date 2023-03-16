import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    gSignin: Boolean,
    toDoList: [
      {
        content: String,
        date: String,
      },
    ],
    completedList: [
      {
        content: String,
        date: String,
        deleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);
export const userModel = mongoose.model("users", userSchema);
