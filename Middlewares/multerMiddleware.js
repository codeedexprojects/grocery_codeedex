const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary'); 

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = 'uploads'; 
    let resourceType = 'image';

    if (file.mimetype.startsWith('video/')) {
      resourceType = 'video';
      folder = 'videos';
    }

    return {
      folder,
      resource_type: resourceType, 
      public_id: Date.now() + '-' + file.originalname.split('.')[0],
    };
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PNG, JPG, JPEG, GIF images and MP4 videos are allowed.'), false);
  }
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024, files: 25 },
});

module.exports = { upload };
