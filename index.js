const express = require('express')
const mongoose = require('mongoose');
const app = express()
const router = require('./source/routes/routes')




// app.use(bodyParser.json());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


// For accessing the variables in .env files..
const dotenv = require('dotenv')
dotenv.config()

mongoose.connect(process.env.MONGODB_URL , ()=>{
    console.log("DB Connected")
});

app.use("/",router)
// app.use(verifyToken)
app.listen((process.env.PORT || 8080),()=>{
    console.log("Server is running..")
})