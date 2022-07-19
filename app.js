const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("./config/db");
require("./config/passport");
const User = require("./model/user");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());

/**
 * All Routes
 * Register route
 * Login route
 * Private route
 */

// Get route
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

/**
Register Route
*/

app.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username: username });
    if (user) {
      res.status(400).json({ message: "User already exist" });
    }
    const hashPass = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: username,
      password: hashPass,
    });
    await newUser.save();
    return res.status(200).json({
      success: true,
      user: {
        username: newUser.username,
        _id: newUser._id,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**

Login route

*/

app.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(401).json({ status: false, message: "User not found" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res
        .status(401)
        .json({ status: false, message: "Password incorrect" });
    }

    const payload = {
      id: user._id,
      username: user.username,
    };
    const token = jwt.sign(payload, "SECRET_KEY", { expiresIn: "2d" });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token: token,
    });
  } catch (error) {
    next(error);
  }
});

/**
This is a private route. Only authenticated user can access this route
*/

app.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    res.status(200).json({
      success: true,
      id: req.user._id,
      username: req.user.username,
    });
  }
);

module.exports = app;
