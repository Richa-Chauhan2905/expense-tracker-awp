import express from "express";
import { createTicket } from "../controllers/contact.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/contact/ticket
router.post("/ticket", protect, createTicket);

export default router;
