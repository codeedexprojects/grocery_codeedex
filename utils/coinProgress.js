const CoinSettings = require("../Models/Admin/CoinSetting/coinSettingModel");

const getCoinProgress = async (cart) => {
  try {
    const settings = await CoinSettings.findOne();
    if (!settings) return { coinsEarned: 0, progress: 0, remaining: 0 };

    const { purchaseThreshold, coinsPerThreshold } = settings;

    // 🛒 Calculate cart total
    let totalAmount = 0;
    for (const item of cart.items) {
      totalAmount += item.quantity * item.price;
    }

    // 🪙 Coins earned (proportional, even before reaching threshold)
    const coinsEarned = (totalAmount / purchaseThreshold) * coinsPerThreshold;

    // 📊 Progress towards next threshold (percentage of threshold reached)
    const progress = (totalAmount % purchaseThreshold) / purchaseThreshold * 100;

    // 💰 Remaining to earn the *next full threshold worth* of coins
    const remaining = purchaseThreshold - (totalAmount % purchaseThreshold);

    return {
      coinsEarned: Math.floor(coinsEarned),  // round down if you only issue full coins
      progress: Math.round(progress),
      remaining
    };
  } catch (err) {
    console.error("Error calculating coin progress:", err);
    return { coinsEarned: 0, progress: 0, remaining: 0 };
  }
};

module.exports = { getCoinProgress };
