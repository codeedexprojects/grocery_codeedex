const User = require("../../../Models/User/Auth/authModel");
const WalletTransaction = require("../../../Models/User/Wallet/walletModel");

// Get Wallet Balance
exports.getWalletBalance = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const user = await User.findById(userId).select("coins");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ balance: user.coins });
  } catch (err) {
    console.error("Error getting wallet balance:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Wallet Transactions
exports.getWalletTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await WalletTransaction.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({ transactions });
  } catch (err) {
    console.error("Error fetching wallet transactions:", err);
    res.status(500).json({ message: "Server error" });
  }
};
