const Gif = require('../../../Models/Admin/Carousal/homeGifModel');

exports.uploadGif = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No GIF file uploaded' });
    }

    const newGif = new Gif({
      filePath: req.file.path,
      fileName: req.file.filename
    });

    await newGif.save();
    res.status(201).json({ message: 'GIF uploaded successfully', gif: newGif });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading GIF', error: error.message });
  }
};

exports.getAllGifs = async (req, res) => {
  try {
    const gifs = await Gif.find().sort({ uploadedAt: -1 });
    res.json(gifs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching GIFs', error: error.message });
  }
};
