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

        if (!f_userName || !f_Pwd) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        const hashedPassword = await bcrypt.hash(f_Pwd, 10); 

        const f_sno = await generateCustomId('ADMIN'); 

        const newAdmin = new Admin({
            f_sno, 
            f_userName,
            f_Pwd: hashedPassword
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
      if (!f_userName || !f_Pwd) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      const admin = await Admin.findOne({ f_userName }); 
      if (!admin) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
  
      const isMatch = await bcrypt.compare(f_Pwd, admin.f_Pwd); 
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const token = jwt.sign({ id: admin._id, f_userName: admin.userName }, process.env.JWT_SECRET, { expiresIn: '12h' });
      
      res.status(200).json({ token,f_userName, message: 'Login successful' });
    } catch (error) {
      console.error(error); 
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

    if (!f_Image || !f_Name || !f_Email || !f_Mobile || !f_Designation || !f_gender || !f_Course) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const courses = Array.isArray(f_Course) ? f_Course : JSON.parse(f_Course);

    const existingEmployee = await Employee.findOne({ email: f_Email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newEmployee = new Employee({
      image: f_Image, 
      name: f_Name,
      email: f_Email,
      mobile: f_Mobile,
      designation: f_Designation,
      gender: f_gender,
      course: courses, 
    });

    await newEmployee.save();
    res.status(201).json({ message: 'Employee created successfully', employee: newEmployee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


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
      const employee = await Employee.findById(employeeId); 
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
      if (!f_Image && !f_Name && !f_Email && !f_Mobile && !f_Designation && !f_gender && !f_Course) {
          return res.status(400).json({ message: 'At least one field must be provided for update' });
      }

      const employee = await Employee.findById(employeeId);
      if (!employee) {
          return res.status(404).json({ message: 'Employee not found' });
      }

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
      const result = await Employee.findByIdAndDelete(employeeId);
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
