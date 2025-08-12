// models/Gif.js
const mongoose = require('mongoose');

const gifSchema = new mongoose.Schema({
  filePath: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Gif', gifSchema);
