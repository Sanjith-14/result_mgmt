const express = require('express')
const router = express.Router()

const item = require('../models/user_model')
const Student = item.Student
const Faculty = item.Faculty
const Course = item.Course
const Batch = item.Batch
const Enrollment = item.Enrollment

//Getting ready(Home page)..
router.get('/', async (req, res) => {
    try {
        res.status(200).json({
            message: "This is homepage.Go to /faculties or /students to see details"
        })
    }
    catch (error) {
        return res.send(error)
    }
})



// Get all students..
// by department , batch
router.get('/students', async (req, res) => {
    try {
        var department = req.body.department
        var batchYear = req.body.batchYear //take from front-end

        const dataItem = await Batch.find({ batchYear: batchYear, dept: department }).select({ students: 1, _id: 0 })
        if(dataItem.length == 0){
            res.status(200).json({
                message: "No students are there"
            })
        }
        else{
            res.status(200).json({
                student: dataItem
            })
        }

    }
    catch (error) {
        return res.send(error)
    }
})


//To get the detail of particular student
router.get('/student-detail/:rollNo', async (req, res) => {
    try {
        var rollNo = req.params.rollNo;

        const dataItem = await Student.find({ rollNo: rollNo })
        // console.log(dataItem)
        if (dataItem.length == 0) {
            res.json({
                message: "Invalid Student"
            })
        }
        // console.log(dataItem.length())
        else {
            res.status(200).json({
                studentDetail: dataItem
            })
        }

    }
    catch (error) {
        return res.send(error)
    }
})


// Post request for add student
router.post('/add-student', async (req, res) => {
    var result = [{"semNo":1 , "subjectMarks":[]},{"semNo":2 , "subjectMarks":[]},{"semNo":3 , "subjectMarks":[]},{"semNo":4 , "subjectMarks":[]},{"semNo":5 , "subjectMarks":[]},{"semNo":6 , "subjectMarks":[]},{"semNo":7 , "subjectMarks":[]},{"semNo":8 , "subjectMarks":[]}]
    const { rollNo, name, admissionNo, DOB, department, email, batchYear, addressLine1, addressLine2, city, state, country,parentName, phoneNum, parentNum } = req.body;
    //save in db
    const student = new Student({ rollNo: rollNo, name: name, admissionNo: admissionNo, DOB: DOB, email: email, batchYear: batchYear, department: department, batchYear: batchYear, addressLine1: addressLine1, addressLine2: addressLine2, city: city, state: state, country:country , parentName: parentName, phoneNum: phoneNum, parentNum: parentNum , result:result })
    await student.save()
    // if status is 200 , just send that..


    const batchItem = await Batch.find({ batchYear: batchYear, dept: department })
    // console.log(batchItem)
    // console.log(batchItem.length)
    if (batchItem.length == 0) {
        const batch = new Batch({ batchYear: batchYear, dept: department, currentSem: 1, students: [rollNo], courses: [] })
        await batch.save()
    }
    else {
        const batch = await Batch.updateOne(
            { dept: department, batchYear: batchYear },   //filter data
            { $push: { students: rollNo } },  //data to be inserted
        )
    }

    return res.status(200).json({
        student: { rollNo, name, admissionNo, DOB, department, email, batchYear, addressLine1, addressLine2, city, state,country, parentName, phoneNum },
        success: "Student added sucessfully"
    })
});


// Update student..
router.put('/update-student', async (req, res) => {
    const filter = { rollNo: req.body.rollNo }  //using this field , we filter these datas..
    const updatedData = {
        name: req.body.name,
        admissionNo: req.body.admissionNo,
        DOB: req.body.DOB,
        email: req.body.email,
        batchYear: req.body.batchYear,
        department: req.body.department,
        batchYear: req.body.batchYear,
        addressLine1: req.body.addressLine1,
        addressLine2: req.body.addressLine2,
        city: req.body.city,
        state: req.body.state,
        country:req.body.country,
        parentName: req.body.parentName,
        phoneNum: req.body.phoneNum
    }

    // const updatedData = { $set:
    //     {
    //      "name" :req.body.name
    //     }
    // }

    const dataItem = await Student.updateOne(filter, updatedData).then((data) => {
        res.json({
            data: data,
            success: "Student updated sucessfully"
        })
    }).catch((err) => {
        return res.send(err);
    })
})


// Delete student
router.delete('/delete-student', async (req, res) => {
    try {
        const filter = { rollNo: req.body.rollNo }  //using this field , we filter these datas..
        // Fetch the student using roll number

        const studentDetail = await Student.find({ rollNo: req.body.rollNo })
        // console.log(studentDetail[0])
        rollNo = studentDetail[0].rollNo
        batchYear = studentDetail[0].batchYear
        department = studentDetail[0].department
        const dataItem = await Student.deleteOne(filter)
        const batchItem = await Batch.updateOne(
            { dept: department, batchYear: batchYear }, //filter data
            { $pull: { students: rollNo } },  //data to be deleted
        )
        res.status(200).json({
            student: dataItem,
            success: "Student deleted sucessfully"
        })
    } catch (error) {
        res.send(error)
    }
})



// Get all Faculties..
router.get('/faculties', async (req, res) => {
    try {
        const dataItem = await Faculty.find({})
        res.status(200).json({
            faculty: dataItem
        })
    }
    catch (error) {
        return res.send(error)
    }
})



// Get all Faculties is..
router.get('/faculties-id', async (req, res) => {
    try {
        const facultyIds = [];
        const dataItem = await Faculty.find({}).select({ facultyId: 1, _id: 0 })
        dataItem.forEach((val) => {
            facultyIds.push(val.facultyId)
        })
        // console.log(facultyIds)
        res.status(200).json({
            faculty: facultyIds
        })
    }
    catch (error) {
        return res.send(error)
    }
})


// Post request for add faculty
router.post('/add-faculty', async (req, res) => {
    const { facultyId, name, DOB, DOJ, department, email, addressLine1, addressLine2, city, state, phoneNum } = req.body;
    //save in db
    const faculty = new Faculty({ facultyId: facultyId, name: name, DOB: DOB, DOJ: DOJ, department: department, email: email, addressLine1: addressLine1, addressLine2: addressLine2, city: city, state: state, phoneNum: phoneNum })
    await faculty.save()
    // if status is 200 , just send that..
    return res.status(200).json({
        faculty: { facultyId, name, DOB, DOJ, department, email, addressLine1, addressLine2, city, state, phoneNum },
        success: "Faculty added sucessfully"
    })
});


// Update faculty..
router.put('/update-faculty', async (req, res) => {
    const filter = { facultyId: req.body.facultyId }
    const updatedData = {
        facultyId: req.body.facultyId,
        name: req.body.name,
        DOB: req.body.DOB,
        DOJ: req.body.DOJ,
        department: req.body.department,
        email: req.body.email,
        addressLine1: req.body.addressLine1,
        addressLine2: req.body.addressLine2,
        city: req.body.city,
        state: req.body.state,
        phoneNum: req.body.phoneNum
    }
    const dataItem = await Faculty.updateOne(filter, updatedData).then((data) => {
        res.json({
            data: data,
            success: "Faculty updated sucessfully"
        })
    }).catch((err) => {
        return res.send(err);
    })
})


// Delete faculty
router.delete('/delete-faculty', async (req, res) => {
    const filter = { facultyId: req.body.facultyId }  //using this field , we filter these datas..
    await Faculty.deleteOne(filter).then((data) => {
        res.json({
            data: data,
            success: "Faculty deleted sucessfully"
        })
    }).catch((err) => {
        return res.send(err);
    })
})


// Get all courses..
router.get('/courses', async (req, res) => {
    try {
        const dataItem = await Course.find({})
        res.status(200).json({
            course: dataItem
        })
    }
    catch (error) {
        return res.send(error)
    }
})

//Get all courses for particular sem
router.get('/courses/sem:semNo', async (req, res) => {
    try {
        const dataItem = await Course.find({ semNo: req.params.semNo })
        if (dataItem.length == 0) {
            res.json({
                course: "Invalid sem"
            })
        }
        // console.log(dataItem.length())
        else {
            res.status(200).json({
                course: dataItem
            })
        }

    }
    catch (error) {
        return res.send(error)
    }
})

// Post request for add course
router.post('/add-course', async (req, res) => {
    const { _id, name, semNo, offeredBy, type, hours, credits, facultyId } = req.body;
    //save in db
    const course = new Course({ _id: _id, name: name, semNo: semNo, offeredBy: offeredBy, type: type, hours: hours, credits: credits, facultyId: facultyId })
    await course.save()
    // if status is 200 , just send that..
    return res.status(200).json({
        course: { _id, name, semNo, offeredBy, type, hours, credits, facultyId },
        success: "Course added sucessfully"
    })
});


// Delete courses
router.delete('/delete-course', async (req, res) => {
    const filter = { _id: req.body._id }  //using this field , we filter these datas..
    await Course.deleteOne(filter).then((data) => {
        res.json({
            data: data,
            success: "Course deleted sucessfully"
        })
    }).catch((err) => {
        return res.send(err);
    })
})


// Update course..
router.put('/update-course', async (req, res) => {
    const filter = { _id: req.body._id }
    const updatedData = {
        name: req.body.name,
        semNo: req.body.semNo,
        offeredBy: req.body.offeredBy,
        hours: req.body.hours,
        credits: req.body.credits,
        facultyId: req.body.facultyId
    }
    const dataItem = await Course.updateOne(filter, updatedData).then((data) => {
        res.json({
            data: data,
            success: "Course updated sucessfully"
        })
    }).catch((err) => {
        return res.send(err);
    })
})


// Get all batches
router.get('/batches', async (req, res) => {
    try {
        const dataItem = await Batch.find({})
        res.status(200).json({
            batches: dataItem
        })

    }
    catch (error) {
        return res.send(error)
    }
})

// Batch add courses - enroll..
router.put('/batch-add-course', async (req, res) => {
    try {
        const department = req.body.department
        const batchYear = req.body.batchYear
        const courseId = req.body.courseId //array
        const courseName = req.body.courseName
        const faculties = req.body.faculties //array
        const currentSem = req.body.currentSem
        for (let i = 0; i < courseId.length; i++) {
            const enrollment = new Enrollment({batchYear:batchYear,department:department,courseId:courseId[i],courseName:courseName[i], facultyId:faculties[i],semNo:currentSem,isCompleted:false})
            await enrollment.save()
        }
        const batch = await Batch.updateOne(
            { dept: department, batchYear: batchYear },   //filter data
            { $set: { currentCourses: [...courseId] } },  //data to be inserted
        )
        
        // Adding courses in result field for Student.
        // console.log("Updated");
        for(let i=0;i<courseId.length;i++){
            const res1 = await Student.updateMany(
                {batchYear:batchYear , department:department},
                {$push:{"result.$[resElement].subjectMarks" : {courseId:courseId[i] , marks:{"cat1":0,"cat2":0,"sem":0,"lab":0} }}},
                {arrayFilters : [{"resElement.semNo":currentSem}]}
            )
        }
        // console.log("Updated end..");
        // Added successfully.
        res.json({
            message : "Enrolled Successfully"
        }) 
    } catch (error) {
        res.json({
            error:error
        })
    }
})


// Adding result to student
router.put('/faculty-add-result',async (req,res)=>{
    // Give result structure to all students..

    // necessary details starts..
    const studRollNo = req.body.studRollNo   //array
    let examType = req.body.examType
    let courseId = req.body.courseId
    const currentSem = req.body.currentSem
    const marks = req.body.marks  //array
    // ends

    const setField = "result.$[resElement].subjectMarks.$[subElement].marks."+examType
    for(let i=0;i<studRollNo.length;i++){
        const response =   await Student.updateOne(
            {rollNo:studRollNo[i]}, 
            {$set: {[setField] : marks[i]}},
             {arrayFilters:[{"resElement.semNo":currentSem},{"subElement.courseId":courseId}]}
        )
    }



    res.json({
        "message":"Result added successfully"
    })
})


// To get courses based on faculty id
router.get('/courses/:facultyId', async (req, res) => {
    try {
        const dataItem = await Enrollment.find({facultyId:req.params.facultyId})
        if(dataItem.length == 0){
            res.status(200).json({
                message:"No courses"
            })
        }
        else{
            res.status(200).json({
                classes: dataItem
            })
        }

    }
    catch (error) {
        return res.send(error)
    }
})





module.exports = router;


// const dept = {"theory" : ["cat1","cat2","sem"],
// "embedded" : ["cat1","cat2","sem","lab"],
// "lab" : ["lab"]}