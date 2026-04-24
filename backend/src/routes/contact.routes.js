import express from "express";
import {
  createTicket,
  getTickets,
  replyToTicket,
} from "../controllers/contact.controller.js";
import { protect, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/contact/ticket
router.post("/ticket", protect, createTicket);
router.get("/tickets", protect, requireAdmin, getTickets);
router.put("/tickets/:id/reply", protect, requireAdmin, replyToTicket);

export default router;
