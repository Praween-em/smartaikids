
const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  purchaseDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Purchase', purchaseSchema);
