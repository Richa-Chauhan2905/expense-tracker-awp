import express from "express";
import {
  createExpense,
  getExpensesByMonth,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

// Create expense (optional receipt upload)
router.post("/", protect, upload.single("receipt"), createExpense);

// List expenses for month: /api/expenses?month=YYYY-MM
router.get("/", protect, getExpensesByMonth);

// Update expense (optional new receipt)
router.put("/:id", protect, upload.single("receipt"), updateExpense);

// Delete expense
router.delete("/:id", protect, deleteExpense);

export default router;
