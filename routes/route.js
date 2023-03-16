import express from "express";
import { deleteTodo, doSignin, doSignUp, getTodo, saveTodo, tickTodo } from "../controllers/controller.js";
import { authMiddleware } from "../middlewares/auth.js";
const router = express.Router();

// Signup user
router.post("/signup", doSignUp);

// Signin user
router.post("/signin",doSignin)

// Save todo
router.post('/save',authMiddleware, saveTodo)

// Get todo list
router.get('/get-todo-list',authMiddleware,getTodo)

//Tick todo
router.get('/tick-todo/:id',authMiddleware,tickTodo)

//Delete todo
router.get('/delete-todo/:id/:type',authMiddleware,deleteTodo)

export default router;
