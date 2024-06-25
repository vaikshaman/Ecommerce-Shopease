import express from "express";
import passport from "passport";
import axios from "axios";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Authenticate the user using Google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: `${process.env.CLIENT_URL}/login/failed`,
  })
);

// Forward the request to Google's authentication server
router.get("/google", async (req, res) => {
  try {
    const response = await axios.get(
      "https://accounts.google.com/o/oauth2/v2/auth",
      {
        params: req.query,
      }
    );
    res.send(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Register or login user to DB
router.get("/login/success", async (req, res) => {
  if (req.user) {
    const userExists = await User.findOne({ email: req.user._json.email });
    if (userExists) {
      generateToken(res, userExists._id);
    } else {
      const newUser = new User({
        name: req.user._json.name,
        email: req.user._json.email,
        password: Date.now(), // Dummy password
      });
      generateToken(res, newUser._id);
      await newUser.save();
    }
    res.status(200).json({
      user: req.user,
      message: "Successfully logged in",
      _id: userExists ? userExists._id : newUser._id,
    });
  } else {
    res.status(403).json({
      message: "Not Authorized",
    });
  }
});

// Login failed
router.get("/login/failed", (req, res) => {
  res.status(401);
  res.json({ error: "Login Failed" });
});

// Logout
router.get("/logout", (req, res) => {
  req.logout(err => {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
});

export default router;
