import ContactTicket from "../models/contact.model.js";

// POST /api/contact/ticket (protected OR public - your choice)
export const createTicket = async (req, res) => {
  try {
    const userId = req.user?._id; // if protected route, req.user exists

    const { name, email, issueType, urgency, message } = req.body;

    if (!name || !email || !issueType || !urgency || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const ticket = await ContactTicket.create({
      user: userId || undefined,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      issueType,
      urgency,
      message: message.trim(),
      status: "open",
    });

    return res.status(201).json({
      message: "Ticket submitted successfully",
      ticketId: ticket._id,
    });
  } catch (error) {
    console.log("Error in createTicket:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/contact/tickets
export const getTickets = async (req, res) => {
  try {
    const tickets = await ContactTicket.find()
      .sort({ createdAt: -1 })
      .populate("user", "fullName email");

    return res.status(200).json(tickets);
  } catch (error) {
    console.log("Error in getTickets:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
