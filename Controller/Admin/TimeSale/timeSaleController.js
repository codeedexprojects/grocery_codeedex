const TimeSale = require('../../../Models/Admin/TimeSale/timeSaleModel');

// Add a Time Sale Product
exports.addTimeSale = async (req, res) => {
  try {
    const { productId, title, image, startTime, endTime } = req.body;

    if (!productId || !title || !image || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ success: false, message: 'Start time must be before end time' });
    }

    const timeSale = await TimeSale.create({
      productId,
      title,
      image,
      startTime,
      endTime
    });

    res.status(201).json({
      success: true,
      message: 'Time sale product added successfully',
      data: timeSale
    });

  } catch (error) {
    console.error('Add Time Sale Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get All Time Sale Products
exports.getTimeSales = async (req, res) => {
  try {
    const timeSales = await TimeSale.find().populate('productId', 'title price');
    res.status(200).json({ success: true, data: timeSales });
  } catch (error) {
    console.error('Get Time Sales Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete Time Sale Product
exports.deleteTimeSale = async (req, res) => {
  try {
    const { id } = req.params;
    const timeSale = await TimeSale.findByIdAndDelete(id);

    if (!timeSale) {
      return res.status(404).json({ success: false, message: 'Time sale product not found' });
    }

    res.status(200).json({ success: true, message: 'Time sale product deleted' });
  } catch (error) {
    console.error('Delete Time Sale Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
