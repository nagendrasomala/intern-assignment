
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  entity: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
