const mongoose = require('mongoose');
const { generateCustomId } = require('./customid'); // Adjust the path if needed

const userSchema = new mongoose.Schema({
  f_sno: { type: String, unique: true, required: true }, // To store a sequential number (could use a counter)
  f_userName: { type: String, required: true, unique: true },
  f_Pwd: { type: String, required: true },
});


// Create or retrieve the Admin model
const Admin = mongoose.models.Admin || mongoose.model('Admin', userSchema);

module.exports = { Admin };
