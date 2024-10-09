const express = require('express');
const router = express.Router();
const { Admin } = require('../models/admin.model')
const Employee = require('../models/employee.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); 
const verifyAdmin = require('./test.routes'); 
require('dotenv').config();
const { generateCustomId } = require('../models/customid');



router.post('/create', async (req, res) => {
    try {
        const { f_userName, f_Pwd } = req.body;

        // Validate input
        if (!f_userName || !f_Pwd) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(f_Pwd, 10); // 10 is the salt rounds

        // Generate f_sno using the counter logic
        const f_sno = await generateCustomId('ADMIN'); // Call your custom ID generator

        // Create a new admin
        const newAdmin = new Admin({
            f_sno, // Set the f_sno from the counter
            f_userName,
            f_Pwd: hashedPassword // Store the hashed password
        });

        await newAdmin.save();
        res.status(201).json({ message: 'Admin created successfully!', admin: newAdmin });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});


router.post('/login', async (req, res) => {
    const f_userName = req.body.username; 
    const f_Pwd = req.body.password; 
    
    try {
      // Validate request body
      if (!f_userName || !f_Pwd) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      // Find the admin by username
      const admin = await Admin.findOne({ f_userName }); // Use findOne to get a single admin
      if (!admin) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
  
      // Compare password
      const isMatch = await bcrypt.compare(f_Pwd, admin.f_Pwd); // Compare with the correct admin
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
  
      // Generate JWT token
      const token = jwt.sign({ id: admin._id, f_userName: admin.userName }, process.env.JWT_SECRET, { expiresIn: '12h' });
      
      res.status(200).json({ token,f_userName, message: 'Login successful' });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ message: 'Server error', error });
    }
  });

  router.get('/check-email', async (req, res) => {
    const { email } = req.query;
    const employee = await Employee.findOne({ email });
    if (employee) {
        return res.json({ exists: true });
    }
    return res.json({ exists: false });
});
  

router.post('/create-employees', verifyAdmin, async (req, res) => {
  const { f_Image, f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course } = req.body;

  try {
    // Validate request body
    if (!f_Image || !f_Name || !f_Email || !f_Mobile || !f_Designation || !f_gender || !f_Course) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Convert f_Course back to an array if it's sent as a string (JSON.parse for the stringified array)
    const courses = Array.isArray(f_Course) ? f_Course : JSON.parse(f_Course);

    // Check if the email already exists
    const existingEmployee = await Employee.findOne({ email: f_Email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create a new employee
    const newEmployee = new Employee({
      image: f_Image, // Firebase image URL
      name: f_Name,
      email: f_Email,
      mobile: f_Mobile,
      designation: f_Designation,
      gender: f_gender,
      course: courses, // Make sure course is an array
    });

    await newEmployee.save();
    res.status(201).json({ message: 'Employee created successfully', employee: newEmployee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// API to fetch all employees
router.get('/employees', verifyAdmin, async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.post('/get-employee', async (req, res) => {
  const { employeeId } = req.body;
  try {
      const employee = await Employee.findById(employeeId); // Use the ID to find the employee
      if (!employee) return res.status(404).json({ message: 'Employee not found' });
      res.json(employee);
  } catch (error) {
      console.error('Error fetching employee:', error);
      res.status(500).json({ message: 'Server error' });
  }
});


router.put('/edit-employee/:id', verifyAdmin, async (req, res) => {
  const { id: employeeId } = req.params;
  const { f_Image, f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course } = req.body;
  try {
      // Validate request body
      if (!f_Image && !f_Name && !f_Email && !f_Mobile && !f_Designation && !f_gender && !f_Course) {
          return res.status(400).json({ message: 'At least one field must be provided for update' });
      }

      // Check if the employee exists
      const employee = await Employee.findById(employeeId);
      if (!employee) {
          return res.status(404).json({ message: 'Employee not found' });
      }

      // Update employee details
      if (f_Image) employee.image = f_Image;
      if (f_Name) employee.name = f_Name;
      if (f_Email) {
          const existingEmail = await Employee.findOne({ f_Email, _id: { $ne: employeeId } });
          if (existingEmail) {
              return res.status(400).json({ message: 'Email already exists' });
          }
          employee.email = f_Email;
      }
      if (f_Mobile) employee.mobile = f_Mobile;
      if (f_Designation) employee.designation = f_Designation;
      if (f_gender) employee.gender = f_gender;
      if (f_Course) employee.course = f_Course;

      await employee.save();
      res.status(200).json({ message: 'Employee updated successfully', employee });
  } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ message: 'Server error', error });
  }
});




router.delete('/delete-employees/:id', verifyAdmin, async (req, res) => {
  const employeeId = req.params.id;


  try {
      // Find and delete the employee
      const result = await Employee.findByIdAndDelete(employeeId);

      // Check if the employee was found and deleted
      if (!result) {
          return res.status(404).json({ message: 'Employee not found' });
      }

      res.status(200).json({ message: `Employee with id ${employeeId} deleted successfully` });
  } catch (error) {
      console.error('Error deleting employee:', error);
      res.status(500).json({ message: 'Error deleting employee', error: error.message });
  }
});

module.exports = router;
