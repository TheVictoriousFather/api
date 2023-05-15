const mongoose = require("mongoose");

const User = mongoose.model("user", {
  name: String,
  email: String,
  password: String,
  lastname: String,
});

module.exports = User;
