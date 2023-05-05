const express = require("express");
require('dotenv').config();
require("./src/db/mongoose.js");
const userRouter = require("./src/routers/user");
const taskRouter = require("./src/routers/task");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(userRouter);
app.use("/tasks", taskRouter);

app.listen(port, () => {
  console.log(`Task app listening on port ${port}`);
});

const User = require("./src/models/usersModel");
const main = async () => {
  const user = await User.findById("63eff7cffb25d015bc365e69")
    .populate("tasks")
    .exec();
  console.log(user.tasks);
};
//main();
