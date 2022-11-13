const express = require('express')
const router = express.Router()

const item = require('../models/user_model')
const Student = item.Student
const Faculty = item.Faculty
const Course = item.Course


//Getting ready(Home page)..
router.get('/',async (req,res)=>{
    try{
        res.status(200).json({
            message:"THis is homepage.Go to /faculties or /students to see details"
        })
    }
    catch(error){
        return res.send(error)
    }
})



// Get all students..
router.get('/students',async (req,res)=>{
    try{
        const dataItem = await Student.find({})
        res.status(200).json({
            student:dataItem
        })
    }
    catch(error){
        return res.send(error)
    }
})


// Post request for add student
router.post('/add-student', async (req, res) => {
    const {rollNo,name,admissionNo,DOB,department,email,batchYear,addressLine1,addressLine2,city,state,parentName,phoneNum } = req.body;
    //save in db
    const student = new Student({rollNo:rollNo,name:name,admissionNo:admissionNo,DOB:DOB,email:email,batchYear:batchYear,department:department,batchYear:batchYear,addressLine1:addressLine1,addressLine2:addressLine2,city:city,state:state,parentName:parentName,phoneNum:phoneNum })
    await student.save()
    // if status is 200 , just send that..
    return res.status(200).json({
        student: {rollNo,name,admissionNo,DOB,department,email,batchYear,addressLine1,addressLine2,city,state,parentName,phoneNum },
    })
});


// Update student..
router.put('/update-student',async (req,res)=>{
    const filter =  {rollNo:req.body.rollNo}  //using this field , we filter these datas..
    // const updatedData = {
    //     name:req.body.name,
    //     admissionNo:req.body.admissionNo,
    //     DOB:req.body.DOB,
    //     email:req.body.email,
    //     batchYear:req.body.batchYear,
    //     department:req.body.department,
    //     batchYear:req.body.batchYear,
    //     addressLine1:req.body.addressLine1,
    //     addressLine2:req.body.addressLine2,
    //     city:req.body.city,
    //     state:req.body.state,
    //     parentName:req.body.parentName,
    //     phoneNum:req.body.phoneNum
    // }

    const updatedData = { $set:
        {
         "name" :req.body.name
        }
    }
    const dataItem = await Student.updateOne(filter,updatedData).then((data)=>{
        res.json({
            data:data,
        })
    }).catch((err)=>{
        return res.send(err);
    })
})


// Delete student
router.delete('/delete-student',async (req,res)=>{
    const filter = {rollNo:req.body.rollNo}  //using this field , we filter these datas..
    await Student.deleteOne(filter).then((data)=>{
        res.json({
            data:data,
        })
    }).catch((err)=>{
        return res.send(err);
    })
})



// Get all Faculties..
router.get('/faculties',async (req,res)=>{
    try{
        const dataItem = await Faculty.find({})
        res.status(200).json({
            faculty:dataItem
        })
    }
    catch(error){
        return res.send(error)
    }
})


// Post request for add faculty
router.post('/add-faculty', async (req, res) => {
    const { facultyId,name,DOB,DOJ,department,email,addressLine1,addressLine2,city,state,phoneNum } = req.body;
    //save in db
    const faculty = new Faculty({ facultyId:facultyId,name:name,DOB:DOB,DOJ:DOJ,department:department,email:email,addressLine1:addressLine1,addressLine2:addressLine2,city:city,state:state,phoneNum:phoneNum })
    await faculty.save()
    // if status is 200 , just send that..
    return res.status(200).json({
        faculty: { facultyId,name,DOB,DOJ,department,email,addressLine1,addressLine2,city,state,phoneNum },
    })
});


// Update faculty..
router.put('/update-faculty',async (req,res)=>{
    const filter =  {facultyId:req.body.facultyId} 
    const updatedData = {
        facultyId:req.body.facultyId,
        name:req.body.name,
        DOB:req.body.DOB,
        DOJ:req.body.DOJ,
        department:req.body.department,
        email:req.body.email,
        addressLine1:req.body.addressLine1,
        addressLine2:req.body.addressLine2,
        city:req.body.city,
        state:req.body.state,
        phoneNum:req.body.phoneNum
    }
    const dataItem = await Faculty.updateOne(filter,updatedData).then((data)=>{
        res.json({
            data:data,
        })
    }).catch((err)=>{
        return res.send(err);
    })
})


// Delete faculty
router.delete('/delete-faculty',async (req,res)=>{
    const filter = {facultyId:req.body.facultyId}  //using this field , we filter these datas..
    await Faculty.deleteOne(filter).then((data)=>{
        res.json({
            data:data,
        })
    }).catch((err)=>{
        return res.send(err);
    })
})


// Get all courses..
router.get('/courses',async (req,res)=>{
    try{
        const dataItem = await Course.find({})
        res.status(200).json({
            course:dataItem
        })
    }
    catch(error){
        return res.send(error)
    }
})


// Post request for add course
router.post('/add-course', async (req, res) => {
    const {_id,name,semNo,offeredBy,hours,credits,facultyId} = req.body;
    //save in db
    const course = new Course( {_id:_id,name:name,semNo:semNo,offeredBy:offeredBy,hours:hours,credits:credits,facultyId:facultyId})
    await course.save()
    // if status is 200 , just send that..
    return res.status(200).json({
        course:  {_id,name,semNo,offeredBy,hours,credits,facultyId} ,
    })
});


// Delete courses
router.delete('/delete-course',async (req,res)=>{
    const filter = {_id:req.body._id}  //using this field , we filter these datas..
    await Course.deleteOne(filter).then((data)=>{
        res.json({
            data:data,
        })
    }).catch((err)=>{
        return res.send(err);
    })
})


// Update course..
router.put('/update-course',async (req,res)=>{
    const filter =  {_id:req.body._id}
    const updatedData = {
        name:req.body.name,
        semNo:req.body.semNo,
        offeredBy:req.body.offeredBy,
        hours:req.body.hours,
        credits:req.body.credits,
        facultyId:req.body.facultyId
    }
    const dataItem = await Course.updateOne(filter,updatedData).then((data)=>{
        res.json({
            data:data,
        })
    }).catch((err)=>{
        return res.send(err);
    })
})

module.exports = router;