import Expense from "../models/expense.model.js";

const monthRange = (monthStr) => {
  const [y, m] = monthStr.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return { start, end };
};

const categoryBreakdown = async (userId, monthStr) => {
  const { start, end } = monthRange(monthStr);

  const rows = await Expense.aggregate([
    { $match: { user: userId, expenseDate: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const categories = rows.map((r) => ({ category: r._id, total: r.total }));
  const monthTotal = rows.reduce((sum, r) => sum + r.total, 0);

  return { month: monthStr, monthTotal, categories };
};

// GET /api/reports/compare?current=YYYY-MM&previous=YYYY-MM (protected)
export const compareMonthsReport = async (req, res) => {
  try {
    const userId = req.user._id;

    const { current, previous } = req.query;
    if (!current || !previous) {
      return res.status(400).json({
        message: "current=YYYY-MM and previous=YYYY-MM are required",
      });
    }

    const currentData = await categoryBreakdown(userId, current);
    const previousData = await categoryBreakdown(userId, previous);

    const difference = currentData.monthTotal - previousData.monthTotal;

    return res.status(200).json({
      currentMonth: currentData,
      previousMonth: previousData,
      totals: {
        currentTotal: currentData.monthTotal,
        previousTotal: previousData.monthTotal,
        difference,
        differenceType:
          difference > 0 ? "positive" : difference < 0 ? "negative" : "neutral",
      },
    });
  } catch (error) {
    console.log("Error in compareMonthsReport:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
