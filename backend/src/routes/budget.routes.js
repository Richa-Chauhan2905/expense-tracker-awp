import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { setMonthlyBudget, getMonthlyBudget } from "../controllers/budget.controller.js";

const router = express.Router();

router.put("/", protect, setMonthlyBudget);     // body: { month, amount }
router.get("/", protect, getMonthlyBudget);     // query: ?month=YYYY-MM

export default router;
