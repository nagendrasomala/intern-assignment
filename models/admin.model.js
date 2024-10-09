const mongoose = require('mongoose');
const { generateCustomId } = require('./customid'); 

const userSchema = new mongoose.Schema({
  f_sno: { type: String, unique: true, required: true }, 
  f_userName: { type: String, required: true, unique: true },
  f_Pwd: { type: String, required: true },
});


const Admin = mongoose.models.Admin || mongoose.model('Admin', userSchema);

module.exports = { Admin };
