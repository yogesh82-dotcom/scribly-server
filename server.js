const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "build")));

let logs = [];
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Database Connected!");
  })
  .catch((err) => {
    console.log(err);
  });

const logSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  title: { required: true, type: String },
  description: { required: true, type: String },
});

const userSchema = new mongoose.Schema({
  email: { type: String },
  password: { type: String },
  cfrmPassword: { type: String },
  createdOn: { type: Date, default: Date.now() },
});

const logModel = mongoose.model("worklog", logSchema);
const userModel = mongoose.model("users", userSchema);


app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});


app.post("/worklogs", async (req, res) => {
  const { userId, title, description } = req.body;
  try {
    const newLog = new logModel({ userId, title, description });
    await newLog.save();
    res.status(200).json(newLog);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({ email, password: hashedPassword });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(404).json({ message: "Invalid Password" });
    }
    req.user = { id: user._id };
    console.log("User logged in with ID:", req.user.id);
    res.status(200).json({ message: "Login Success", userId: user._id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/worklogs/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const logs = await logModel.find({ userId });
    res.status(200).json(logs);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

app.put("/worklogs/:id", async (req, res) => {
  try {
    const { title, description } = req.body;
    const id = req.params.id;
    const updatedLog = await logModel.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
    );
    if (!updatedLog) {
      return res.status(404).json({ message: "worklog not found" });
    }
    res.json(updatedLog);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

app.put("/forgot-password/", async (req, res) => {
  try {
    const { email, password, cfrmPassword } = req.body;
    const updatedUser = await userModel.findOne({ email });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (password !== cfrmPassword) {
      return res.status(404).json({ message: " Password doesn't match" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    updatedUser.password = hashedPassword;
    await updatedUser.save();
    return res.status(200).json({ message: "Password Updated!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/worklogs/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await logModel.findByIdAndDelete(id);
    res.json("deleted successfully");
    res.status(204).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

const port = process.env.port || 8000;
app.listen(port, () => {
  console.log("server initiated at " + port);
});
