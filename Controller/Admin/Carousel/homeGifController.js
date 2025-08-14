const HomeCarousel = require('../../../Models/Admin/Carousel/homeGifModel');
const fs = require('fs');

// Create Carousel (only one allowed)
exports.createCarousel = async (req, res) => {
  try {
    // Check if a carousel already exists
    const existingCarousel = await HomeCarousel.findOne();
    if (existingCarousel) {
      return res.status(400).json({ message: 'Only one carousel section is allowed. Please update the existing one.' });
    }

    if (!req.files || !req.files.backgroundImage || !req.files.gif) {
      return res.status(400).json({ message: 'Background image and GIF are required' });
    }

    const backgroundImage = req.files.backgroundImage[0].path;
    const gif = req.files.gif[0].path;

    const newCarousel = new HomeCarousel({
      backgroundImage,
      gif
    });

    await newCarousel.save();
    res.status(201).json({ message: 'Carousel created successfully', data: newCarousel });
  } catch (error) {
    res.status(500).json({ message: 'Error creating carousel', error: error.message });
  }
};

// Get Carousel (only one)
exports.getCarousel = async (req, res) => {
  try {
    const carousel = await HomeCarousel.findOne();
    if (!carousel) {
      return res.status(404).json({ message: 'No carousel found' });
    }
    res.json(carousel);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching carousel', error: error.message });
  }
};

// Update Carousel
exports.updateCarousel = async (req, res) => {
  try {
    const { id } = req.params;

    const carousel = await HomeCarousel.findById(id);
    if (!carousel) {
      return res.status(404).json({ message: 'Carousel not found' });
    }

    if (req.files && req.files.backgroundImage) {
      if (carousel.backgroundImage && fs.existsSync(carousel.backgroundImage)) {
        fs.unlinkSync(carousel.backgroundImage);
      }
      carousel.backgroundImage = req.files.backgroundImage[0].path;
    }

    if (req.files && req.files.gif) {
      if (carousel.gif && fs.existsSync(carousel.gif)) {
        fs.unlinkSync(carousel.gif);
      }
      carousel.gif = req.files.gif[0].path;
    }

    await carousel.save();
    res.json({ message: 'Carousel updated successfully', data: carousel });
  } catch (error) {
    res.status(500).json({ message: 'Error updating carousel', error: error.message });
  }
};

// Delete Carousel
exports.deleteCarousel = async (req, res) => {
  try {
    const { id } = req.params;

    const carousel = await HomeCarousel.findById(id);
    if (!carousel) {
      return res.status(404).json({ message: 'Carousel not found' });
    }

    if (carousel.backgroundImage && fs.existsSync(carousel.backgroundImage)) {
      fs.unlinkSync(carousel.backgroundImage);
    }
    if (carousel.gif && fs.existsSync(carousel.gif)) {
      fs.unlinkSync(carousel.gif);
    }

    await HomeCarousel.findByIdAndDelete(id);
    res.json({ message: 'Carousel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting carousel', error: error.message });
  }
};
