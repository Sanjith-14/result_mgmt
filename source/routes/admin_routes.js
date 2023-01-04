const express = require('express')
const adminRouter = express.Router()
const jwt = require("jsonwebtoken");

const item = require('../models/user_model')
const Student = item.Student
const Faculty = item.Faculty
const Course = item.Course
const Batch = item.Batch
const Enrollment = item.Enrollment
const Credential = item.Credential
const Admin = item.Admin

const verifyToken = require("../../middleware/verifyToken");

adminRouter.use(express.json());
adminRouter.use(express.urlencoded({ extended: true }));

var dropDown = { "cat1": false, "cat2": false, "sem": false, "lab": false, "assignment": false, "attendance": false }
var dropDownUpdated = dropDown;

//Getting ready(Home page)..
adminRouter.get('/', async (req, res) => {
    try {
        res.status(200).json({
            message: "Welcome to result management.",
            // details: req.user //maybe the user details from middleware
        })
    }
    catch (error) {
        res.send(error)
    }
})


// Post request for add admin
adminRouter.post('/add-admin', verifyToken, async (req, res) => {
    try {
        if (req.user.role == 'admin') {
            const { adminId, name, DOB, email, addressLine1, addressLine2, city, state, country, phoneNum } = req.body;
            //save in db
            let flag = 0;
            const existingAdmin = await Admin.find({}).select({ adminId: 1 })
            existingAdmin.forEach((data) => {
                if (data.adminId == adminId) {
                    flag = 1;
                    return res.json({ message: "Admin already exists" })
                }
            })

            if (flag == 0) {
                const admin = new Admin({ adminId: adminId, name: name, DOB: DOB, email: email, addressLine1: addressLine1, addressLine2: addressLine2, city: city, state: state, country: country, phoneNum: phoneNum })
                await admin.save()


                const credentail = new Credential({ email: email, password: adminId, role: "admin" })
                await credentail.save()


                // if status is 200 , just send that..
                return res.status(200).json({
                    admin: { adminId, name, DOB, email, addressLine1, addressLine2, city, state, country, phoneNum },
                    success: "Admin added sucessfully"
                })
            }
        }
        else {
            res.status(401).json({ message: "unauthorized" })
        }

    } catch (error) {
        res.send(error)
    }
});

// delete admin
adminRouter.delete('/delete-admin', verifyToken, async (req, res) => {
    if (req.user.role == 'admin') {
        const filter = { adminId: req.body.adminId }  //using this field , we filter these datas..
        await Admin.deleteOne(filter).then((data) => {
            res.json({
                data: data,
                success: "Admin deleted sucessfully"
            })
        }).catch((err) => {
            return res.send(err);
        })
    }
    else {
        res.status(401).json({ message: "unauthorized" })
    }
})


// Get all Faculties..
adminRouter.get('/admins', verifyToken, async (req, res) => {
    try {
        if (req.user.role == 'admin') {
            const dataItem = await Admin.find({})
            res.status(200).json({
                admin: dataItem
            })
        }
        else {
            res.status(401).json({ message: "unauthorized" })
        }

    }
    catch (error) {
        return res.send(error)
    }
})



//To get the detail of particular student
adminRouter.get('/admin-detail/:adminId', verifyToken, async (req, res) => {
    try {
        if (req.user.role == "admin") {
            var adminId = req.params.adminId;
            const dataItem = await Admin.find({ adminId: adminId })
            // console.log(dataItem)
            if (dataItem.length == 0) {
                res.json({
                    message: "Invalid Admin"
                })
            }
            // console.log(dataItem.length())
            else {
                res.status(200).json({
                    adminDetail: dataItem
                })
            }
        }
        else {
            res.status(401).json({ message: "unauthorized" })
        }

    }
    catch (error) {
        return res.send(error)
    }
})


// Post request for add student
adminRouter.post('/add-student', verifyToken, async (req, res) => {
    try {
        if (req.user.role == 'admin') {
            const { rollNo, name, admissionNo, DOB, department, email, batchYear, addressLine1, addressLine2, city, state, country, parentName, phoneNum, parentNum } = req.body;

            let flag = 0
            const existingStudents = await Student.find({}).select({ rollNo: 1 })
            existingStudents.forEach((data) => {
                if (data.rollNo == rollNo) {
                    flag = 1
                    return res.json({ message: "Student already exists" })
                }
            })


            if (flag == 0) {
                var result = [{ "semNo": 1, "subjectMarks": [] }, { "semNo": 2, "subjectMarks": [] }, { "semNo": 3, "subjectMarks": [] }, { "semNo": 4, "subjectMarks": [] }, { "semNo": 5, "subjectMarks": [] }, { "semNo": 6, "subjectMarks": [] }, { "semNo": 7, "subjectMarks": [] }, { "semNo": 8, "subjectMarks": [] }]
                const student = new Student({ rollNo: rollNo, name: name, admissionNo: admissionNo, DOB: DOB, department: department, email: email, batchYear: batchYear, addressLine1: addressLine1, addressLine2: addressLine2, city: city, state: state, country: country, parentName: parentName, phoneNum: phoneNum, parentNum: parentNum, result: result })
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


                const credentail = new Credential({ email: email, password: rollNo, role: "student" })
                await credentail.save()
                // if status is 200 , just send that..

                return res.status(200).json({
                    student: { rollNo, name, admissionNo, DOB, department, email, batchYear, addressLine1, addressLine2, city, state, country, parentName, phoneNum },
                    success: "Student added sucessfully"
                })
            }
        }
        else {
            res.status(401).json({ message: "unauthorized" })
        }
    } catch (error) {
        res.send(error)
    }
});


// Update student..
adminRouter.put('/update-student', verifyToken, async (req, res) => {
    if (req.user.role == 'admin') {
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
            country: req.body.country,
            parentName: req.body.parentName,
            phoneNum: req.body.phoneNum
        }

        const dataItem = await Student.updateOne(filter, updatedData).then((data) => {
            res.json({
                data: data,
                success: "Student updated sucessfully"
            })
        }).catch((err) => {
            return res.send(err);
        })
    }
    else {
        res.status(401).json({ message: "unauthorized" })
    }
})


// Delete student if delete also remove details in credentials
adminRouter.delete('/delete-student', verifyToken, async (req, res) => {
    try {
        if (req.user.role == 'admin') {
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
        }
        else {
            res.status(401).json({ message: "unauthorized" })
        }
    } catch (error) {
        res.send(error)
    }
})

// Get all Faculties..
adminRouter.get('/faculties', verifyToken, async (req, res) => {
    try {
        if (req.user.role == 'admin') {
            const dataItem = await Faculty.find({})
            res.status(200).json({
                faculty: dataItem
            })
        }
        else {
            res.status(401).json({ message: "unauthorized" })
        }

    }
    catch (error) {
        return res.send(error)
    }
})


// Get all Faculties is..
adminRouter.get('/faculties-details', verifyToken, async (req, res) => {
    try {
        if (req.user.role == 'admin') {
            const facultyIds = [];
            const facultyName = []
            const dept = []
            const dataItem = await Faculty.find({}).select({ facultyId: 1, name: 1, department: 1, _id: 0 })
            dataItem.forEach((val) => {
                facultyIds.push(val.facultyId)
                facultyName.push(val.name)
                dept.push(val.department)
            })
            // console.log(facultyIds)
            // console.log(facultyName);
            // console.log(dept);
            res.status(200).json({
                facultyId: facultyIds,
                facultyName: facultyName,
                department: dept
            })
        }
        else {
            res.status(401).json({ message: "unauthorized" })
        }
    }
    catch (error) {
        return res.send(error)
    }
})


// Post request for add faculty
adminRouter.post('/add-faculty', verifyToken, async (req, res) => {
    try {
        if (req.user.role == 'admin') {
            const { facultyId, name, DOB, DOJ, department, email, addressLine1, addressLine2, city, state, country, phoneNum } = req.body;
            //save in db
            let flag = 0;
            const existingFaculty = await Faculty.find({}).select({ facultyId: 1 })
            existingFaculty.forEach((data) => {
                if (data.facultyId == facultyId) {
                    flag = 1;
                    return res.json({ message: "Faculty already exists" })
                }
            })

            if (flag == 0) {
                const faculty = new Faculty({ facultyId: facultyId, name: name, DOB: DOB, DOJ: DOJ, department: department, email: email, addressLine1: addressLine1, addressLine2: addressLine2, city: city, state: state, country: country, phoneNum: phoneNum })
                await faculty.save()


                const credentail = new Credential({ email: email, password: facultyId, role: "faculty" })
                await credentail.save()


                // if status is 200 , just send that..
                return res.status(200).json({
                    faculty: { facultyId, name, DOB, DOJ, department, email, addressLine1, addressLine2, city, state, country, phoneNum },
                    success: "Faculty added sucessfully"
                })
            }

        }
        else {
            res.status(401).json({ message: "unauthorized" })
        }
    } catch (error) {
        res.send(error)
    }
});


// Update faculty..
adminRouter.put('/update-faculty', verifyToken, async (req, res) => {
    if (req.user.role == 'admin') {
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
            country: req.body.country,
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
    }
    else {
        res.status(401).json({ message: "unauthorized" })
    }
})


// Delete faculty
adminRouter.delete('/delete-faculty', verifyToken, async (req, res) => {
    if (req.user.role == 'admin') {
        const filter = { facultyId: req.body.facultyId }  //using this field , we filter these datas..
        await Faculty.deleteOne(filter).then((data) => {
            res.json({
                data: data,
                success: "Faculty deleted sucessfully"
            })
        }).catch((err) => {
            return res.send(err);
        })
    }
    else {
        res.status(401).json({ message: "unauthorized" })
    }
})

//Get all courses for particular sem
adminRouter.get('/courses/sem:semNo', verifyToken, async (req, res) => {
    try {
        if (req.user.role == 'admin') {
            const dataItem = await Course.find({ semNo: req.params.semNo })
            if (dataItem.length == 0) {
                res.json({
                    course: []
                })
            }
            // console.log(dataItem.length())
            else {
                res.status(200).json({
                    course: dataItem
                })
            }
        }
        else {
            res.status(401).json({ message: "unauthorized" })
        }
    }
    catch (error) {
        return res.send(error)
    }
})


// Post request for add course
adminRouter.post('/add-course', verifyToken, async (req, res) => {
    try {
        if (req.user.role == 'admin') {
            const { _id, name, semNo, offeredBy, type, hours, credits, facultyId } = req.body;

            let flag = 0;
            const existingCourse = await Course.find({}).select({ _id: 1 })
            existingCourse.forEach((data) => {
                if (data._id == _id) {
                    flag = 1;
                    return res.json({ message: "Course already exists" })
                }
            })

            if (flag == 0) {
                const course = new Course({ _id: _id, name: name, semNo: semNo, offeredBy: offeredBy, type: type, hours: hours, credits: credits, facultyId: facultyId })
                await course.save()  //save in db
                return res.status(200).json({
                    course: { _id, name, semNo, offeredBy, type, hours, credits, facultyId },
                    success: "Course added sucessfully"
                })
            }
        }
        else {
            return res.status(401).json({ message: "unauthorized" })
        }
    } catch (error) {
        return res.send(error)
    }
});


// Delete courses
adminRouter.delete('/delete-course', verifyToken, async (req, res) => {
    if (req.user.role == 'admin') {
        const filter = { _id: req.body._id }  //using this field , we filter these datas..
        await Course.deleteOne(filter).then((data) => {
            res.json({
                data: data,
                success: "Course deleted sucessfully"
            })
        }).catch((err) => {
            return res.send(err);
        })
    }
    else {
        res.status(401).json({ message: "unauthorized" })
    }
})


// Update course..
adminRouter.put('/update-course', verifyToken, async (req, res) => {
    if (req.user.role == 'admin') {
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
    }
    else {
        res.status(401).json({ message: "unauthorized" })
    }
})


// Get all batches
adminRouter.get('/batches', verifyToken, async (req, res) => {
    try {
        if (req.user.role == 'admin') {
            const dataItem = await Batch.find({})
            res.status(200).json({
                batches: dataItem
            })
        }
        else {
            res.status(401).json({ message: "unauthorized" })
        }
    }
    catch (error) {
        return res.send(error)
    }
})

// Batch add courses - enroll..
adminRouter.put('/batch-add-course', verifyToken, async (req, res) => {
    try {
        if (req.user.role == 'admin') {
            const department = req.body.department
            const batchYear = req.body.batchYear
            const courseId = req.body.courseId //array
            const courseName = req.body.courseName //array
            const faculties = req.body.faculties //array
            const currentSem = req.body.currentSem
            const courseType = req.body.courseType //array
            // const oldCourseId = req.body.oldCourseId


            const res1 = await Student.updateMany(
                { batchYear: batchYear, department: department },
                // Added grade..
                { $set: { "result.$[resElement].subjectMarks": [] } },
                { arrayFilters: [{ "resElement.semNo": currentSem }] }
            )

            // for (let i = 0; i < oldCourseId.length; i++) {
            //     const del = await Enrollment.findOneAndDelete(
            //         {batchYear:batchYear , department:department,courseId:oldCourseId[i]}
            //     )
            //     console.log("Deleted")
            // }

            const del = await Enrollment.deleteMany({ batchYear: batchYear, department: department, semNo: currentSem })
            // console.log("Deleted..")


            for (let i = 0; i < courseId.length; i++) {
                const enrollment = new Enrollment({ batchYear: batchYear, department: department, courseId: courseId[i], courseName: courseName[i], facultyId: faculties[i], semNo: currentSem, isCompleted: false, courseType: courseType[i] })
                await enrollment.save()
            }

            const batch = await Batch.updateOne(
                { dept: department, batchYear: batchYear },   //filter data
                { $set: { currentCourses: [...courseId] } },  //data to be inserted
            )

            // Adding courses in result field for Student.
            // console.log("Updated");
            for (let i = 0; i < courseId.length; i++) {
                const res1 = await Student.updateMany(
                    { batchYear: batchYear, department: department },
                    // Added grade..
                    { $push: { "result.$[resElement].subjectMarks": { courseId: courseId[i], courseType: courseType[i], marks: { "cat1": 0, "cat2": 0, "sem": 0, "lab": 0, "assignment": 0, "grade": '' } } } },
                    { arrayFilters: [{ "resElement.semNo": currentSem }] }
                )
            }
            // console.log("Updated end..");
            // Added successfully.
            res.json({
                success: "Enrolled Successfully"
            })
        }
        else {
            res.status(401).json({ message: "unauthorized" })
        }
    } catch (error) {
        res.json({
            error: error
        })
    }
})

// Promoting the batch
adminRouter.put('/promote-batch', verifyToken, async (req, res) => {
    try {
        if (req.user.role == "admin") {
            const batch = await Batch.find({ batchYear: req.body.batchYear, dept: req.body.dept })
            var semNo = parseInt(batch[0].currentSem) + 1
            const batchUpdate = await Batch.updateOne({ batchYear: req.body.batchYear, dept: req.body.dept }, { $set: { currentSem: semNo, currentCourses: [] } })
            res.status(200).json({
                message: "Batch promoted successfully"
            })
        }
        else {
            res.status(401).json({ message: "unauthorized" })
        }
    } catch (error) {
        res.send(error)
    }
})

adminRouter.put('/edit-dropdown', verifyToken, (req, res) => {
    if (req.user.role == 'admin') {
        try {
            var examType = req.body.examType
            var updated = dropDown;
            if (examType == 'cat1') {
                updated.cat1 = true
                updated.cat2 = false
                updated.sem = false
                updated.lab = false
                updated.assignment = false
                updated.attendance = false
            }
            else if (examType == 'cat2') {
                updated.cat1 = false
                updated.cat2 = true
                updated.sem = false
                updated.lab = false
                updated.assignment = false
                updated.attendance = false
            }
            else if (examType == 'sem') {
                updated.cat1 = false
                updated.cat2 = false
                updated.sem = true
                updated.lab = false
                updated.assignment = false
                updated.attendance = false
            }
            else if (examType == 'lab') {
                updated.cat1 = false
                updated.cat2 = false
                updated.sem = false
                updated.lab = true
                updated.assignment = false
                updated.attendance = false
            }
            else if (examType == 'assignment') {
                updated.cat1 = false
                updated.cat2 = false
                updated.sem = false
                updated.lab = false
                updated.assignment = true
                updated.attendance = false
            }
            else if (examType == 'attendance') {
                updated.cat1 = false
                updated.cat2 = false
                updated.sem = false
                updated.lab = false
                updated.assignment = false
                updated.attendance = true
            }
            else {
                updated.cat1 = false
                updated.cat2 = false
                updated.sem = false
                updated.lab = false
                updated.assignment = false
                updated.attendance = false
            }
            dropDownUpdated = updated
            return res.status(200).json({ dropDown: dropDownUpdated })
        } catch (error) {
            res.send(error)
        }
    }
    else {
        res.status(401).json({ message: "unauthorized" })
    }
})

module.exports = adminRouter