import Budget from "../models/budget.model.js";

// PUT /api/budget (protected) body: { month:"YYYY-MM", amount:1234 }
export const setMonthlyBudget = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month, amount } = req.body;

    if (!month || amount === undefined) {
      return res.status(400).json({ message: "month and amount are required" });
    }

    const updated = await Budget.findOneAndUpdate(
      { user: userId, month },
      {
        amount: Number(amount),
        currency: req.user.currencyPreference || "INR",
      },
      { upsert: true, new: true },
    );

    return res.status(200).json(updated);
  } catch (error) {
    console.log("Error in setMonthlyBudget:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/budget?month=YYYY-MM (protected)
export const getMonthlyBudget = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month } = req.query;

    if (!month) return res.status(400).json({ message: "month is required" });

    const budget = await Budget.findOne({ user: userId, month });
    return res.status(200).json(budget || null);
  } catch (error) {
    console.log("Error in getMonthlyBudget:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
