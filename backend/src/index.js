import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";

import {connectDB} from "./lib/db.js";

import userRoutes from "./routes/user.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import reportRoutes from "./routes/report.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import budgetRoutes from "./routes/budget.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.use("/uploads", express.static(path.join(process.cwd(), "src", "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "Expense Tracker API running" });
});

app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/budget", budgetRoutes);

const PORT = process.env.PORT || 5000;

await connectDB();
app.listen(PORT, () => {
  console.log(`✅ Listening on port ${PORT}`);
});
