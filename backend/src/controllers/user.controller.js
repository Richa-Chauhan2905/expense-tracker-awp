import generateToken from "../lib/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";

// SIGNUP (elaborative)
export const signup = async (req, res) => {
  const { fullName, email, password, phone, address, city, state } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: "Full name, email and password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || "",
      address: address || "",
      city: city || "",
      state: state || "",
      currencyPreference: "INR",
    });

    generateToken(newUser._id, res);

    return res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      address: newUser.address,
      city: newUser.city,
      state: newUser.state,
      currencyPreference: newUser.currencyPreference,
      isAdmin: newUser.isAdmin,
    });
  } catch (error) {
    console.log("Error in signup controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, res);

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      state: user.state,
      currencyPreference: user.currencyPreference,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.log("Error in login controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      path: "/",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET ME (PROFILE)
export const getMe = async (req, res) => {
  try {
    // req.user is set by protect middleware
    return res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in getMe controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE PROFILE (required for Profile page)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const { fullName, email, phone, address, city, state } = req.body;

    if (!fullName || !email) {
      return res
        .status(400)
        .json({ message: "Full name and email are required" });
    }

    // Email uniqueness check (excluding current user)
    const emailLower = email.toLowerCase();
    const emailTaken = await User.findOne({
      email: emailLower,
      _id: { $ne: userId },
    });
    if (emailTaken) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        email: emailLower,
        phone: phone || "",
        address: address || "",
        city: city || "",
        state: state || "",
      },
      { new: true },
    ).select("-password");

    return res.status(200).json(updated);
  } catch (error) {
    console.log("Error in updateProfile controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE CURRENCY (global currency preference)
export const updateCurrency = async (req, res) => {
  try {
    const { currencyPreference } = req.body;
    if (!currencyPreference) {
      return res.status(400).json({ message: "Please select a currency" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.currencyPreference = currencyPreference;
    await user.save();

    return res.status(200).json({
      message: "Currency updated",
      currency: user.currencyPreference,
    });
  } catch (error) {
    console.log("Error in updateCurrency controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json(users);
  } catch (error) {
    console.log("Error in getAllUsers controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
