import express from "express";
import { signup, login, logout, getMe, updateProfile, updateCurrency } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/currency", protect, updateCurrency);

export default router;
