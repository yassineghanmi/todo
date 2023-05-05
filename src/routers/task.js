const Task = require("../models/tasksModel");
const User = require("../models/usersModel");
const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const { findById } = require("../models/usersModel");
//get_all_tasks
router.get("/", auth, async (req, res) => {
  const match = {};
  const pageNumber = parseInt(req.query.pageNumber) || 1;
  const pageSize = parseInt(req.query.pageSize) || 2;

  const itemsToSkip = (pageNumber - 1) * pageSize;
  const itemsToLimit = pageSize;

  if (req.query.completed) {
    match.completed = req.query.completed;
  }
  try {
    const user = await User.findById({ _id: req.user._id })
      .populate({
        path: "tasks",
        match,
        options: {
          skip: itemsToSkip,
          limit: itemsToLimit,
        },
      })
      .exec();
    res.send(user.tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

//get_task_by_id
router.get("/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.find({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

//create_task
router.post("/", auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

//update_task
router.patch("/:id", auth, async (req, res) => {
  const allowUpdate = ["description", "completed"];
  const labels = Object.keys(req.body);
  const isValid = labels.every((label) => {
    return allowUpdate.includes(label);
  });
  if (!isValid) {
    return res.status(400).send("this label not included in the form list");
  }
  try {
    const _id = req.params.id;
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (task) {
      Object.assign(task, req.body);
      await task.save();
      return res.send(task);
    } else {
      return res.status(404).send("error 404");
    }
  } catch (e) {
    res.status(404).send("something wrong");
  }
});

//delete_task
router.delete("/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findByIdAndDelete({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send({});
    }
    return res.send(task);
  } catch (e) {
    res.send("catch");
  }
});

module.exports = router;
