const HomeCarousel = require('../../../Models/Admin/Carousal/homeGifModel');
const fs = require('fs');

exports.createCarousel = async (req, res) => {
  try {
    const { title, sections } = req.body;

    if (!req.files || !req.files.backgroundImage || !req.files.gifs) {
      return res.status(400).json({ message: 'Background image and GIFs are required' });
    }

    const backgroundImage = req.files.backgroundImage[0].path;
    const gifs = req.files.gifs.map(file => file.path);

    let parsedSections = [];
    try {
      parsedSections = JSON.parse(sections);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid sections format, must be JSON' });
    }

    const newCarousel = new HomeCarousel({
      title,
      backgroundImage,
      gifs,
      sections: parsedSections
    });

    await newCarousel.save();
    res.status(201).json({ message: 'Carousel created successfully', data: newCarousel });
  } catch (error) {
    res.status(500).json({ message: 'Error creating carousel', error: error.message });
  }
};

exports.getAllCarousels = async (req, res) => {
  try {
    const carousels = await HomeCarousel.find().populate('sections.productIds');
    res.json(carousels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching carousels', error: error.message });
  }
};

exports.updateCarousel = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, sections } = req.body;

    const carousel = await HomeCarousel.findById(id);
    if (!carousel) {
      return res.status(404).json({ message: 'Carousel not found' });
    }

   
    if (title) carousel.title = title;

    
    if (sections) {
      try {
        carousel.sections = JSON.parse(sections);
      } catch (err) {
        return res.status(400).json({ message: 'Invalid sections format, must be JSON' });
      }
    }

    
    if (req.files && req.files.backgroundImage) {
      if (carousel.backgroundImage && fs.existsSync(carousel.backgroundImage)) {
        fs.unlinkSync(carousel.backgroundImage);
      }
      carousel.backgroundImage = req.files.backgroundImage[0].path;
    }

    
    if (req.files && req.files.gifs) {
      
      carousel.gifs.forEach(gifPath => {
        if (fs.existsSync(gifPath)) {
          fs.unlinkSync(gifPath);
        }
      });
      carousel.gifs = req.files.gifs.map(file => file.path);
    }

    await carousel.save();
    res.json({ message: 'Carousel updated successfully', data: carousel });
  } catch (error) {
    res.status(500).json({ message: 'Error updating carousel', error: error.message });
  }
};

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
    carousel.gifs.forEach(gifPath => {
      if (fs.existsSync(gifPath)) {
        fs.unlinkSync(gifPath);
      }
    });

    await HomeCarousel.findByIdAndDelete(id);
    res.json({ message: 'Carousel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting carousel', error: error.message });
  }
};
