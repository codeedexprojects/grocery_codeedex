const CoinSettings = require("../Models/Admin/CoinSetting/coinSettingModel");

const getCoinProgress = async (cart, user) => {
  try {
    const settings = await CoinSettings.findOne();
    if (!settings) {
      return { threshold: 0, coinsFromProgress: 0, totalCoinsAfterOrder: 0, nextThresholdRemaining: 0 };
    }

    const { purchaseThreshold, coinsPerThreshold } = settings;

    // 🛒 Cart total
    let totalAmount = 0;
    for (const item of cart.items) {
      totalAmount += item.quantity * item.price;
    }

    // 👤 User's last saved progress
    let lastProgress = user?.coinProgress || 0;

    // ✅ Coins already earned till now
    const coinsFromProgress = (lastProgress / purchaseThreshold) * coinsPerThreshold;

    // 🆕 Simulate after adding this order
    let combinedProgress = lastProgress + totalAmount;

    // 🎯 Total coins possible after this order
    const totalCoinsAfterOrder = (combinedProgress / purchaseThreshold) * coinsPerThreshold;

    // 💡 Remaining amount needed for next threshold
    const nextThresholdRemaining = purchaseThreshold - (combinedProgress % purchaseThreshold);

    return {
      threshold: purchaseThreshold,
      coinsFromProgress,        // already earned till now
      totalCoinsAfterOrder,     // ✅ coins that can be earned after this order
      nextThresholdRemaining
    };
  } catch (err) {
    console.error("Error calculating coin progress:", err);
    return { threshold: 0, coinsFromProgress: 0, totalCoinsAfterOrder: 0, nextThresholdRemaining: 0 };
  }
};


module.exports = { getCoinProgress };
