const express = require('express')
const mongoose = require('mongoose');
const app = express()
const router = require('./source/routes/routes')
const admin_routes = require('./source/routes/admin_routes')
const faculty_routes = require('./source/routes/faculty_routes')
const student_routes = require('./source/routes/student_routes')




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
app.use(admin_routes)
app.use(faculty_routes)
app.use(student_routes)


// app.use(verifyToken)
app.listen((process.env.PORT || 8080),()=>{
    console.log("Server is running..")
})