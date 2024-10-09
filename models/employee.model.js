const mongoose = require('mongoose');
const { generateCustomId } = require('./customid');

const employeeSchema = new mongoose.Schema({
  empId: { type: String, unique: true }, // Auto-generated custom employee ID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  designation: { type: String, required: true },
  gender: { type: String, required: true },
  course: { type: [String], required: true }, // Changed to an array of strings
  image: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Pre-save hook to generate empId
employeeSchema.pre('save', async function (next) {
  if (!this.empId) {
    this.empId = await generateCustomId('EMP'); // Generate ID with 'EMP' prefix
  }
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);
