import express from "express";
import {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
  updateCurrency,
  getAllUsers,
} from "../controllers/user.controller.js";
import { protect, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", protect, getMe);
router.get("/admin/all", protect, requireAdmin, getAllUsers);
router.put("/profile", protect, updateProfile);
router.put("/currency", protect, updateCurrency);

export default router;
