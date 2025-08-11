const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  mainCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MainCategory',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Image is required']
  },
  status: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
