const Task = require("./tasksModel");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email not valid");
        }
      },
    },
    age: {
      type: Number,
      min: [6, "Must be at least 6, got {VALUE}"],
      max: 100,
    },
    password: {
      type: String,
      trim: true,
      required: true,
      validate(value) {
        if (value.length <= 7) {
          throw new Error("password must be at least 8 caracteres");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: { type: Buffer },
  },
  { timestamps: true }
);

//Relation
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

userSchema.pre("save", async function (next) {
  const user = this;
  let isModified = user.isModified("password");
  if (user.isModified("password")) {
    const hashPassword = await bcrypt.hash(user.password, 8);
    user.password = hashPassword;
    return next();
  }
  next();
});

//cascade delete
userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });

  next();
});

userSchema.static("findByCredentials", async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("wrong emaim or password");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("wrong password");
  return user;
});

//Create_JWT
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    {
      _id: user._id.toString(),
    },
    "SECRET",
    { expiresIn: "168h" }
  );
  user.tokens = [...user.tokens, { token }];
  await user.save();
  return token;
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  delete user.avatar

  return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
