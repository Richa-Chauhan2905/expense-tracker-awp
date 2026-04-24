import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";

import { connectDB } from "./src/lib/db.js";
import { seedAdminUser } from "./src/lib/seedAdmin.js";

import userRoutes from "./src/routes/user.routes.js";
import expenseRoutes from "./src/routes/expense.routes.js";
import reportRoutes from "./src/routes/report.routes.js";
import contactRoutes from "./src/routes/contact.routes.js";
import budgetRoutes from "./src/routes/budget.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:4200",
      "http://127.0.0.1:4200",
      "http://192.168.29.74:4200",
    ],
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
await seedAdminUser();
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
