import Expense from "../models/expense.model.js";

/** helper: get [start,end) date range for a YYYY-MM string */
const monthRange = (monthStr) => {
  // monthStr: "2026-02"
  const [y, m] = monthStr.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0)); // next month
  return { start, end };
};

// POST /api/expenses  (protected)  + optional receipt file
export const createExpense = async (req, res) => {
  try {
    const userId = req.user._id;

    const { expenseDate, amount, title, category, currencyAtTime } = req.body;

    if (!expenseDate || !amount || !title || !category) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const receipt = req.file
      ? {
          url: `/uploads/receipts/${req.file.filename}`,
          fileName: req.file.originalname,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
        }
      : {
          url: "",
          fileName: "",
          fileType: "",
          fileSize: 0,
        };

    const created = await Expense.create({
      user: userId,
      expenseDate: new Date(expenseDate),
      amount: Number(amount),
      title: title.trim(),
      category: category.trim(),
      receipt,
      currencyAtTime: currencyAtTime || req.user.currencyPreference || "INR",
    });

    return res.status(201).json(created);
  } catch (error) {
    console.log("Error in createExpense:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/expenses?month=YYYY-MM (protected)
export const getExpensesByMonth = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: "month=YYYY-MM is required" });
    }

    const { start, end } = monthRange(month);

    const expenses = await Expense.find({
      user: userId,
      expenseDate: { $gte: start, $lt: end },
    }).sort({ expenseDate: -1, createdAt: -1 });

    return res.status(200).json(expenses);
  } catch (error) {
    console.log("Error in getExpensesByMonth:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /api/expenses/:id (protected) + optional new receipt file
export const updateExpense = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const expense = await Expense.findOne({ _id: id, user: userId });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const { expenseDate, amount, title, category } = req.body;

    if (expenseDate !== undefined) expense.expenseDate = new Date(expenseDate);
    if (amount !== undefined) expense.amount = Number(amount);
    if (title !== undefined) expense.title = title.trim();
    if (category !== undefined) expense.category = category.trim();

    // If new file uploaded, replace receipt metadata
    if (req.file) {
      expense.receipt = {
        url: `/uploads/receipts/${req.file.filename}`,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
      };
    }

    await expense.save();
    return res.status(200).json(expense);
  } catch (error) {
    console.log("Error in updateExpense:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/expenses/:id (protected)
export const deleteExpense = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const deleted = await Expense.findOneAndDelete({ _id: id, user: userId });
    if (!deleted) {
      return res.status(404).json({ message: "Expense not found" });
    }

    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.log("Error in deleteExpense:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
