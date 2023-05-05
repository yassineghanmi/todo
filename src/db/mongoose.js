const mongoose = require("mongoose");
const validator = require("validator");
// Connect MongoDB at default port 27017.
mongoose
  .connect(process.env.MONGODB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    autoIndex: true, // make this also true
  })
  .then(() => {
    return console.log("MongoDB Connection Succeeded.");
  });
