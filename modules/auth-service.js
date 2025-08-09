const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
let User;

const userSchema = new mongoose.Schema({
  userName: { type: String, unique: true },
  password: String,
  email: String,
  loginHistory: [{ dateTime: String, userAgent: String }]
});

module.exports.initialize = function () {
  return mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { User = mongoose.model("users", userSchema); });
};

module.exports.registerUser = async function (userData) {
  if(userData.password !== userData.password2) throw "Passwords do not match";
  const hash = await bcrypt.hash(userData.password, 10);
  const newUser = new User({ userName: userData.userName, password: hash, email: userData.email, loginHistory: [] });
  await newUser.save();
};

module.exports.checkUser = async function (userData) {
  const user = await User.findOne({ userName: userData.userName });
  if(!user) throw `Cannot find user: ${userData.userName}`;
  const isValid = await bcrypt.compare(userData.password, user.password);
  if(!isValid) throw "Incorrect Password";
  user.loginHistory.unshift({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });
  await user.save();
  return user;
};
