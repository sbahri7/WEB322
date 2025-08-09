// /modules/auth-service.js
const mongoose = require('mongoose');
require('dotenv').config(); // make sure .env is loaded in local dev

let User; // will store the Mongoose model

// Define a schema for your Users
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true
  },
  password: String,
  email: String,
  loginHistory: [{
    dateTime: Date,
    userAgent: String
  }]
});

// Initialize DB connection
module.exports.initialize = function () {
  return new Promise((resolve, reject) => {

    // ✅ Pick the database URI from the environment
    const mongoURI = process.env.MONGODB_URI || process.env.MONGODB;

    if (!mongoURI) {
      reject("MongoDB connection string is missing! Check your .env or Vercel env vars.");
      return;
    }

    // Connect to MongoDB
    mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(() => {
      User = mongoose.model('users', userSchema);
      console.log("✅ MongoDB connection established");
      resolve();
    }).catch(err => {
      reject("MongoDB connection error: " + err);
    });
  });
};

// Register a new user
module.exports.registerUser = function (userData) {
  return new Promise((resolve, reject) => {
    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
      return;
    }

    bcrypt = require('bcryptjs');
    bcrypt.hash(userData.password, 10)
      .then(hash => {
        userData.password = hash;
        let newUser = new User(userData);
        return newUser.save();
      })
      .then(() => resolve())
      .catch(err => {
        if (err.code === 11000) {
          reject("User Name already taken");
        } else {
          reject("There was an error creating the user: " + err);
        }
      });
  });
};

// Check user login
module.exports.checkUser = function (userData) {
  return new Promise((resolve, reject) => {
    User.findOne({ userName: userData.userName }).exec()
      .then(user => {
        if (!user) {
          reject("Unable to find user: " + userData.userName);
        } else {
          const bcrypt = require('bcryptjs');
          bcrypt.compare(userData.password, user.password)
            .then(match => {
              if (match) {
                // update login history
                user.loginHistory.push({
                  dateTime: new Date().toString(),
                  userAgent: userData.userAgent
                });
                user.save().then(() => resolve(user));
              } else {
                reject("Incorrect Password for user: " + userData.userName);
              }
            });
        }
      }).catch(err => {
        reject("Unable to find user: " + userData.userName);
      });
  });
};
