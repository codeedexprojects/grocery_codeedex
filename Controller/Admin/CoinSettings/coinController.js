const CoinSettings = require('../../../Models/Admin/CoinSetting/coinSettingModel');

// 📌 Create or Update Coin Settings
exports.updateCoinSettings = async (req, res) => {
  try {
    const { referralBonus, purchaseThreshold, coinsPerThreshold, redemptionRate } = req.body;

    let settings = await CoinSettings.findOne();
    if (!settings) {
      settings = new CoinSettings({ referralBonus, purchaseThreshold, coinsPerThreshold, redemptionRate });
    } else {
      settings.referralBonus = referralBonus ?? settings.referralBonus;
      settings.purchaseThreshold = purchaseThreshold ?? settings.purchaseThreshold;
      settings.coinsPerThreshold = coinsPerThreshold ?? settings.coinsPerThreshold;
      settings.redemptionRate = redemptionRate ?? settings.redemptionRate;
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Coin settings updated successfully',
      settings
    });

  } catch (error) {
    console.error('Error updating coin settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 📌 Get Coin Settings
exports.getCoinSettings = async (req, res) => {
  try {
    const settings = await CoinSettings.findOne();
    if (!settings) {
      return res.status(404).json({ success: false, message: 'No coin settings found' });
    }
    res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching coin settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
