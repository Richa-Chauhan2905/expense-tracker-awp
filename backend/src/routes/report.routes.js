import express from "express";
import { compareMonthsReport } from "../controllers/report.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// /api/reports/compare?current=YYYY-MM&previous=YYYY-MM
router.get("/compare", protect, compareMonthsReport);

export default router;
