const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  title: String,
  content: String,
  createdAt: Date,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Entry', entrySchema);
