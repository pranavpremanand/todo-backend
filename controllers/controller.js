import bcrypt from "bcrypt";
import { userModel } from "../models/userModel.js";
import jwt_decode from "jwt-decode";
import jwt from "jsonwebtoken";

// Do signup
export const doSignUp = async (req, res) => {
  try {
    let newUser;
    let userEmail;
    if (req.body.type !== "google") {
      req.body.pass = await bcrypt.hash(req.body.pass, 10);
      userEmail = req.body.email;
      newUser = new userModel({
        password: req.body.pass,
        ...req.body,
        gSignin: false,
      });
    } else {
      const user = jwt_decode(req.body.credential);
      const { email, given_name } = user;
      userEmail = email;
      newUser = new userModel({
        name: given_name,
        email: userEmail,
        gSignin: true,
      });
    }
    const existUser = await userModel.findOne({ email: userEmail });
    if (!existUser) {
      
      newUser.save().then((response) => {
        const accessToken = jwt.sign(
            { id: response._id },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: "7d",
            }
          );
        res.status(201).json({ response, accessToken });
      });
    } else {
      if (req.body.type === "google") {
        res.status(200).json({ response, accessToken });
      } else {
        res.status(200).json({ message: "Email already exist" });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

//Signin
export const doSignin = async (req, res) => {
  try {
    let email;
    if (req.body.type === "google") {
      const decodedData = jwt_decode(req.body.credential);
      email = decodedData.email;
      var { given_name } = decodedData;
    } else {
      email = req.body.email;
    }
    const user = await userModel.findOne({ email: email });
    if (user) {
      const accessToken = jwt.sign(
        { id: user.id },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "7d",
        }
      );
      if (req.body.type === "google") {
        res.status(200).json({ user, accessToken });
      } else {
        if (user.gSignin) {
          res.status(200).json({ message: "Try google signin" });
        } else {
          const verifyPass = await bcrypt.compare(req.body.pass, user.password);
          if (verifyPass) {
            res.status(200).json({ user, accessToken });
          } else {
            res.status(200).json({ message: "Incorrect password" });
          }
        }
      }
    } else {
      if (req.body.type === "google") {
        const newUser = new userModel({
          name: given_name,
          email: email,
          gSignin: true,
        });
        newUser.save().then((response) => {
          const accessToken = jwt.sign(
            { id: response.id },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: "7d",
            }
          );
          res.status(201).json({ response, accessToken });
        });
      } else {
        res.status(200).json({ message: "User doesn't exist" });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

// Save todo
export const saveTodo = async (req, res) => {
  try {
    const content = {
      content: req.body.content,
      date: new Date(),
    };
    await userModel.updateOne(
      { _id: req.userId },
      { $push: { toDoList: content } }
    );
    const user = await userModel.findOne({ _id: req.userId });

    const todo = user.toDoList[user.toDoList.length - 1];
    res.status(200).json(todo);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Get todo list
export const getTodo = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.userId });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

//Tick todo
export const tickTodo = async (req, res) => {
  try {
    const user = await userModel.findOneAndUpdate(
      { _id: req.userId },
      { $pull: { toDoList: { _id: req.params.id } } }
    );
    const todo = user.toDoList.find((todo) => todo.id === req.params.id);
    todo.date = new Date();
    await userModel.updateOne(
      { _id: req.userId },
      { $push: { completedList: todo } }
    );
    res.status(200).json(todo);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

export const deleteTodo = async (req, res) => {
  try {
    if (req.params.type === "completedList") {
      await userModel.updateOne(
        { _id: req.userId },
        { $pull: { completedList: { _id: req.params.id } } }
      );
    } else {
      await userModel.updateOne(
        { _id: req.userId },
        { $pull: { toDoList: { _id: req.params.id } } }
      );
    }
    res.status(200).json(true);
  } catch (err) {
    res.status(500).json(err);
  }
};
