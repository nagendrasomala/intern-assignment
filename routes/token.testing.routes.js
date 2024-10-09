const express = require('express');
const router = express.Router();

const verifyAdmin = require('./test.routes');



router.post('/test-admin', verifyAdmin, (req, res) => {
  res.status(200).send('Admin token verified successfully!');
});

module.exports = router;
