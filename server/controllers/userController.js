const User = require("../models/User");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');

//!Generate a JWT token for authentication
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
};

//!Register a new user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email is valid
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    // Check if the password is strong
    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ message: "Password must be strong" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user instance
    const user = new User({ name, email, password });
    await user.save();

    // Generate a token
    const token = generateToken(user._id);

    // Respond with user data and token
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error("Error occurred during registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//!User Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if the password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response with user details and token
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error("Error occurred during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//! finding an existing user by id
const findUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);

    // Check if user exists
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//! Fetch all users from the database 
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//! Update user details
const updateUser = async (req, res) => {
  try {
    let token = req.user.token;
    
    // Check if the email already exists (only if email is being updated)
    if (req.body.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
        return res.status(400).json({ message: "Email already in use." });
      }
    }

    if (req.body.email.trim() === '') {
        return res.status(400).json({ message: "Email can't be empty" });
    }

    if (req.body.name.trim() === '') {
      return res.status(400).json({ message: "Name can't be empty" });
  }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      token: token,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


//! Change password
const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//! upload profile image
const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove old profile image if it exists and is not the default one
        if (user.profileImage && user.profileImage.startsWith('/uploads/')) {
            const oldImagePath = path.join(__dirname, '..', user.profileImage);
            fs.unlink(oldImagePath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error('Error deleting old image:', err);
                }
            });
        }

        // Save new profile image
        const imageUrl = `/uploads/${req.file.filename}`;
        user.profileImage = imageUrl;
        await user.save();

        res.json({ profileImage: imageUrl });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


//! get user profile
const getUserProfile = async (req, res) => {
  try {
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
  } catch (err) {
      res.status(400).json({ message: err.message });
  }
};


module.exports = { registerUser, loginUser, findUser, getUsers, updateUser, changePassword, uploadProfileImage, getUserProfile };
