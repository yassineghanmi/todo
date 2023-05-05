const express = require("express");
const User = require("../models/usersModel");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeMail } = require("../email/account");

const router = new express.Router();
// Create User
router.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    const { email, name } = user;
    await user.generateAuthToken();
    sendWelcomeMail(email, name);
    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

//get_user_profile
router.get("/users/profile", auth, async (req, res) => {
  res.send(req.user);
});

//logout_user
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send({ message: `see you soon ${req.user.name}` });
  } catch (e) {
    res.status(500).send();
  }
});

//logout_all
router.post("/users/logout/all", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send({ message: `see you soon ${req.user.name}` });
  } catch (e) {
    res.status(500).send();
  }
});

// Get All User
router.get("/users", async (req, res) => {
  try {
    const user = await User.find();
    res.send(user);
  } catch (e) {
    res.send("blblblblbl");
  }
});

// Update User
router.patch("/users/profile", auth, async (req, res) => {
  const allowUpdate = ["name", "email", "password", "age"];
  const labels = Object.keys(req.body);
  const isValid = labels.every((label) => {
    return allowUpdate.includes(label);
  });
  if (!isValid) {
    return res.status(400).send("this label not included in the form list");
  }
  try {
    const user = req.user;
    if (user) {
      Object.assign(user, req.body);
      await user.save();
      res.send(user);
    } else {
      res.status(404).send("error 404");
    }
  } catch (e) {
    res.status(404).send("something wrong");
  }
});
// Delete User
router.delete("/users/profile", auth, async (req, res) => {
  try {
    await req.user.delete();
    res.send(req.user);
  } catch (e) {
    res.send("catch");
  }
});

// User_Login
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(404).send(e);
  }
});

const storage = multer.memoryStorage({
  filename: function (req, file, cb) {
    const id = uuidv4();
    file.originalname = id + file.originalname;
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("images only!"));
    }
  },
});

//upload user avatar
router.post(
  "/users/profile/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize(320, 320)
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//get_profile_image
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/jpg");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

//delete profile image
router.delete("/users/profile/avatar", auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send("avatar deleted!").status(200);
  } catch (e) {
    res.send(e).status(400);
  }
});

module.exports = router;
