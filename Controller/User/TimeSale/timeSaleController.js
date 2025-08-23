const TimeSale = require('../../../Models/Admin/TimeSale/timeSaleModel');


exports.getTimeSales = async (req, res) => {
  try {
    const timeSales = await TimeSale.find().populate('productId', 'title price');
    res.status(200).json({ success: true, data: timeSales });
  } catch (error) {
    console.error('Get Time Sales Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};