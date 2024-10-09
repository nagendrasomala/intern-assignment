const express = require('express');
const app = express();
const PORT = process.env.PORT || 7080;
const cors = require('cors');
require('dotenv').config()
const connectDb = require('./db/db')
const adminRouter = require('./routes/admin.routes')
const testRouter = require('./routes/token.testing.routes')
app.use(cors());
app.use(express.json())
app.use('/admin' , adminRouter);
app.use('/token' , testRouter)



app.get('/hitme' , (req , res)=>{
    res.send('Hello');
})


app.listen(PORT , async ()=>{
    await connectDb()
    console.log(`Server is running on port ${PORT}`);
    
})