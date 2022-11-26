const express = require('express')
const router = express.Router()
const jwt = require("jsonwebtoken");
// For accessing the variables in .env files..
const dotenv = require('dotenv')
dotenv.config()

// const busboyBodyParser = require('busboy-body-parser');
// router.use(busboyBodyParser());
// var expressBusboy = require('express-busboy');
// expressBusboy.extend(router)
// const bodyParser = require('body-parser');
// router.use(bodyParser.json())
// router.use(bodyParser.urlencoded({ extended: true }));

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const verifyToken = require("../../middleware/verifyToken");


const multer = require('multer');

// middlewar
var storage = multer.diskStorage({
    destination: "uploads",
    filename: function (req, file, cb) {
        const originalname = file.originalname;
        // const extension = originalname.split('.')[-1]
        // const newFileName = uuid.v1() + " "+extension
        cb(null, originalname);
    }
});

const upload = multer({ storage: storage }).single("image")



const item = require('../models/user_model')
const Student = item.Student
const Faculty = item.Faculty
const Course = item.Course
const Batch = item.Batch
const Enrollment = item.Enrollment
const Credential = item.Credential
const Admin = item.Admin

//Getting ready(Home page)..
router.get('/', async (req, res) => {
    try {
        const currentSem = 2
        const rollNo = "20BEE100"
        const stud = await Student.find({ rollNo: rollNo }).select({ result: 1 })
        res.status(200).json({
            message: "Welcome to Result Management system",
            // details: req.user //maybe the user details from middleware
        })

    }
    catch (error) {
        res.send(error)
    }
})


// Change password..
router.get('/check-password', verifyToken, async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        const credential = await Credential.find({ email: email, password: password }).select({ email: 1, password: 1 })
        // console.log(credential)
        if (credential.length == 0) {
            res.status(200).json({ message: "Invalid password" })
        }
        else {
            res.status(200).json({ message: "Correct password" })
        }
    } catch (error) {
        res.send(error)
    }
})

// Change password
router.put('/change-password', verifyToken, async (req, res) => {
    try {
        const email = req.body.email
        const details = await Credential.find({ email: email })
        const password = details[0].password
        // console.log(password)
        const updatedpassword = req.body.password
        if (password == updatedpassword) {
            res.status(200).json({ message: "Old & new password are same" })
        }
        else {
            const credential = Credential.findOneAndUpdate({ email: email }, { password: updatedpassword })
            res.status(200).json({ message: "Password changed successfully" })
        }
    } catch (error) {
        res.send(error)
    }

})

// Forgot password
router.put('/forget-password', async (req, res) => {
    try {
        const email = req.body.email
        const updatedpassword = req.body.password
        const credential = await Credential.findOneAndUpdate({ email: email }, { password: updatedpassword })
        res.status(200).json({ message: "Password changed successfully" })
    } catch (error) {
        res.send(error)
    }

})


// Post request for add admin
router.post('/add-admin', verifyToken, async (req, res) => {
    try {
        if (req.user.role == 'admin') {
            await item.Check.deleteMany({});

            // Upload image through form-data
            upload(req, res, async (err) => {
                if (err) {
                    console.log(err)
                }
                else {
                    const temp = new item.Check({ id: req.body.adminId })
                    await temp.save()
                    const det = await item.Check.find({})
                    let flag = 0;
                    const existingAdmins = await Admin.find({}).select({ adminId: 1 })
                    console.log(existingAdmins)
                    existingAdmins.forEach((data) => {
                        if (data.adminId == det[0].id) {
                            console.log(det[0].id)
                            flag = 1
                            return res.json({ message: "Admin already exists" })
                        }
                    })


                    if (flag == 0) {

                        const admin = new Admin({
                            adminId: req.body.adminId, name: req.body.name, DOB: req.body.DOB, email: req.body.email, addressLine1: req.body.addressLine1, addressLine2: req.body.addressLine2, city: req.body.city, state: req.body.state, country: req.body.country, phoneNum: req.body.phoneNum,
                            image: {
                                data: req.file.filename,
                                contentType: 'image/png'
                            }
                        })
                        await admin.save().then((_) => {
                            console.log("Image uploaded...")
                            // return res.json({ message: "Successfully uploaded",success:"Admin added successfully" })
                        }).catch((error) => {
                            return res.send(error)
                        })

                        const credentail = new Credential({ email: req.body.email, password: det[0].id, role: "admin" })
                        await credentail.save()

                        return res.status(200).json({
                            success: "Admin added sucessfully"
                        })
                    }

                }
            })

        }
        else {
            res.status(401).json({ message: "unauthorized" })
        }
    } catch (error) {
        res.send(error)
    }
});

// delete admin
router.delete('/delete-admin', verifyToken, async (req, res) => {
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
router.get('/admins', verifyToken, async (req, res) => {
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
router.get('/admin-detail/:adminId', verifyToken, async (req, res) => {
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


// Get all students..
// by department , batch
router.get('/students', verifyToken, async (req, res) => {
    try {
        if (req.user.role == 'faculty') {
            var department = req.body.department
            var batchYear = req.body.batchYear //take from front-end

            const dataItem = await Batch.find({ batchYear: batchYear, dept: department }).select({ students: 1, _id: 0 })
            if (dataItem.length == 0) {
                res.status(200).json({
                    students: []
                })
            }
            else {
                res.status(200).json({
                    students: dataItem[0].students
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


//To get the detail of particular student
router.get('/student-detail/:rollNo', verifyToken, async (req, res) => {
    try {
        if (req.user.role == "faculty" || req.user.role == "admin" || req.user.role == "student") {
            var rollNo = req.params.rollNo;
            const dataItem = await Student.find({ rollNo: rollNo }).select({ result: 0 })
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
        else {
            res.status(401).json({ message: "unauthorized" })
        }

    }
    catch (error) {
        return res.send(error)
    }
})


// Post request for add student
router.post('/add-student', verifyToken, async (req, res) => {
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
                const student = new Student({ rollNo: rollNo, name: name, admissionNo: admissionNo, DOB: DOB, email: email, batchYear: batchYear, department: department, batchYear: batchYear, addressLine1: addressLine1, addressLine2: addressLine2, city: city, state: state, country: country, parentName: parentName, phoneNum: phoneNum, parentNum: parentNum, result: result })
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
router.put('/update-student', verifyToken, async (req, res) => {
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
router.delete('/delete-student', verifyToken, async (req, res) => {
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
router.get('/faculties', verifyToken, async (req, res) => {
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

//To get the detail of particular faculty
router.get('/faculty-detail/:facultyId', verifyToken, async (req, res) => {
    try {
        if (req.user.role == "faculty" || req.user.role == "admin") {
            var facultyId = req.params.facultyId;
            const dataItem = await Faculty.find({ facultyId: facultyId })
            // console.log(dataItem)
            if (dataItem.length == 0) {
                res.json({
                    message: "Invalid Faculty"
                })
            }
            // console.log(dataItem.length())
            else {
                res.status(200).json({
                    facultyDetail: dataItem
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

// Get all Faculties is..
router.get('/faculties-details', verifyToken, async (req, res) => {
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
router.post('/add-faculty', verifyToken, async (req, res) => {
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
router.put('/update-faculty', verifyToken, async (req, res) => {
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
router.delete('/delete-faculty', verifyToken, async (req, res) => {
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


// Get all courses..
router.get('/courses', verifyToken, async (req, res) => {
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
router.get('/courses/sem:semNo', verifyToken, async (req, res) => {
    try {
        if (req.user.role == 'admin') {
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
        else {
            res.status(401).json({ message: "unauthorized" })
        }
    }
    catch (error) {
        return res.send(error)
    }
})

// Post request for add course
router.post('/add-course', verifyToken, async (req, res) => {
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
router.delete('/delete-course', verifyToken, async (req, res) => {
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
router.put('/update-course', verifyToken, async (req, res) => {
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
router.get('/batches', verifyToken, async (req, res) => {
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
router.put('/batch-add-course', verifyToken, async (req, res) => {
    try {
        if (req.user.role == 'admin') {
            const department = req.body.department
            const batchYear = req.body.batchYear
            const courseId = req.body.courseId //array
            const courseName = req.body.courseName //array
            const faculties = req.body.faculties //array
            const currentSem = req.body.currentSem
            const courseType = req.body.courseType //array

            for (let i = 0; i < courseId.length; i++) {
                const enrollment = new Enrollment({ batchYear: batchYear, department: department, courseId: courseId[i], courseName: courseName[i], facultyId: faculties[i], semNo: currentSem, isCompleted: false , courseType:courseType[i] })
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
                    { $push: { "result.$[resElement].subjectMarks": { courseId: courseId[i], marks: { "cat1": 0, "cat2": 0, "sem": 0, "lab": 0, "assignment": 0, "grade": '' } } } },
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


// Adding result to student
router.put('/faculty-add-result', verifyToken, async (req, res) => {
    try {
        if (req.user.role == 'faculty') {
            // Give result structure to all students..
            // necessary details starts..
            const studRollNo = req.body.studRollNo   //array
            let examType = req.body.examType
            let courseId = req.body.courseId
            const currentSem = req.body.currentSem
            const marks = req.body.marks  //array

            // ends
            if (examType == "sem") {

                var grades = ['RA', 'RA', 'RA', 'RA', 'RA', 'B', 'B+', 'A', 'A+', 'O']
                const setField = "result.$[resElement].subjectMarks.$[subElement].marks." + examType
                const setGrade = "result.$[resElement].subjectMarks.$[subElement].marks.grade"

                for (let i = 0; i < studRollNo.length; i++) {
                    const response = await Student.updateOne(
                        { rollNo: studRollNo[i] },
                        { $set: { [setField]: marks[i] } },
                        { arrayFilters: [{ "resElement.semNo": currentSem }, { "subElement.courseId": courseId }] }
                    )
                    // Calculating grade for the student
                    const student = await Student.find({ rollNo: studRollNo[i] }).select({ result: 1, _id: 0 })
                    const data = student[0].result[currentSem - 1].subjectMarks
                    var index;
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].courseId == courseId) {
                            index = i
                            break;
                        }
                    }
                    // console.log(index);

                    var gradeInt;
                    const temp = student[0].result[currentSem - 1].subjectMarks[index].marks
                    // console.log(student[0].result[currentSem-1].subjectMarks[index].marks)
                    var mark;

                    const subtype = await Course.find({ _id: courseId }).select({ type: 1, _id: 0 })
                    // console.log(subtype[0].type)

                    if (subtype.type == "theory") {
                        mark = temp.cat1 * 0.4 + temp.cat2 * 0.4 + temp.sem * 0.4 + temp.assignment
                    }
                    else if (subtype.type == 'embedded') {
                        mark = (temp.cat1 * 0.4 + temp.cat2 * 0.4 + temp.sem * 0.4 + temp.assignment) * 0.6 + (temp.lab * 0.4)
                    }
                    gradeInt = Math.ceil(mark / 10) - 1
                    // console.log(temp.cat1 + "+" + temp.cat2  + "+" + temp.sem + "20")
                    // console.log(Math.ceil((temp.cat1 * 0.4 + temp.cat2 * 0.4 + temp.sem * 0.4 + 20) / 10));
                    // console.log(grades[gradeInt])  //Gives A or O

                    // Update grade for a student
                    const response1 = await Student.updateOne(
                        { rollNo: studRollNo[i] },
                        { $set: { [setGrade]: grades[gradeInt] } },
                        { arrayFilters: [{ "resElement.semNo": currentSem }, { "subElement.courseId": courseId }] }
                    )



                    // upload cgpa to student
                    let post = 1
                    const enroll = await Enrollment.find({ semNo: currentSem, department: studRollNo.substring(3, 5) })
                    for (let j = 0; j < enroll.length; j++) {
                        if (enroll[j].isCompleted == false) {
                            post = 0;
                            break;
                        }
                    }
                    if (post == 1) {
                        let reGrade = [];
                        let sumGrad = 0
                        let i;
                        for (i = 0; i < stud[0].result[currentSem - 1].subjectMarks.length; i++) {
                            reGrade[0] = stud[0].result[currentSem - 1].subjectMarks[i].marks.grade
                            var grad = reGrade[0] == 'O' ? 10 : reGrade[0] == 'A+' ? 9 : reGrade[0] == 'A' ? 8 : reGrade[0] == 'B+' ? 7 : reGrade[0] == 'B' ? 6 : 1
                            sumGrad += grad
                        }
                        var sgpa = sumGrad/i
                        Student.findOneAndUpdate({ rollNo: studRollNo[i] }, { $push: { SGPA: sgpa } }).then(() => {
                            console.log("added cgpa")  
                        })
                    }


                }

                Enrollment.findOneAndUpdate({ courseId: courseId }, { $set: { isCompleted: true } }).then(() => {
                    console.log("success")
                })


            }

            else {
                const setField = "result.$[resElement].subjectMarks.$[subElement].marks." + examType
                for (let i = 0; i < studRollNo.length; i++) {
                    const response = await Student.updateOne(
                        { rollNo: studRollNo[i] },
                        { $set: { [setField]: marks[i] } },
                        { arrayFilters: [{ "resElement.semNo": currentSem }, { "subElement.courseId": courseId }] }
                    )
                }
            }
            res.json({
                success: "Result added successfully"
            })
        }
        else {
            res.status(401).json({ message: "unauthorized" })
        }
    }
    catch (error) {
        res.send(error)
    }
})


// To get courses based on faculty id
router.get('/courses/:facultyId', verifyToken, async (req, res) => {
    try {
        if (req.user.role == 'faculty') {
            const dataItem = await Enrollment.find({ facultyId: req.params.facultyId })
            if (dataItem.length == 0) {
                res.status(200).json({
                    message: "No courses"
                })
            }
            else {
                res.status(200).json({
                    classes: dataItem
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

// get roll no by decrypt token
// To get result for particular student..
router.get('/result/:RollNo', verifyToken, async (req, res) => {
    try {
        var rollNo = req.params.RollNo;
        const dataItem = await Student.find({ rollNo: rollNo }).select({ result: 1 })
        if (dataItem.length == 0) {
            res.status(200).json({
                message: "No students are there"
            })
        }
        else {
            res.status(200).json({
                result: dataItem[0].result
            })
        }

    }
    catch (error) {
        return res.send(error)
    }
})

//for login with email and password..
router.get('/login-user', async (req, res) => {
    try {
        const { email, password } = req.body;
        const dataItem = await Credential.find({ email: email, password: password }).select({ password: 0, _id: 0 })
        // console.log(dataItem)
        if (dataItem.length == 0) {
            res.json({
                message: "Invalid Credentials"
            })
        }
        else {
            try {
                const role = dataItem[0].role
                // console.log(role+" "+email);
                const token = jwt.sign({ email: email, role: role }, process.env.TOKEN_SECRET.toString(), { expiresIn: '86400s' });
                // console.log(token);
                // console.log(dataItem);
                if (role == 'student') {
                    const student = await Student.find({ email: dataItem[0].email }).select({ rollNo: 1, _id: 0 })
                    res.status(200).json({ accessToken: token, rollNo: student[0].rollNo });
                }
                else if (role == 'admin') {
                    const admin = await Admin.find({ email: dataItem[0].email }).select({ adminId: 1, _id: 0 })
                    res.status(200).json({ accessToken: token, adminId: admin[0].adminId });
                }
                else if (role == 'faculty') {
                    const faculty = await Faculty.find({ email: dataItem[0].email }).select({ facultyId: 1, _id: 0 })
                    // console.log(faculty[0].facultyId);
                    res.status(200).json({ accessToken: token, facultyId: faculty[0].facultyId });
                }
                else {
                    res.status(401).json({ message: "Invalid user.." })
                }
            }
            catch (error) {
                return res.status(400).json({ error: error });
            }

        }

    }
    catch (error) {
        return res.send(error)
    }
})


// for login with microsoft
router.get('/social-login', async (req, res) => {
    try {
        const email = req.body.email;
        const dataItem = await Credential.find({ email: email }).select({ password: 0, _id: 0 })
        // console.log(dataItem)
        if (dataItem.length == 0) {
            res.json({
                message: "Invalid Credentials"
            })
        }
        else {
            try {
                const role = dataItem[0].role
                // console.log(role + " " + email);
                const token = jwt.sign({ email: email, role: role }, process.env.TOKEN_SECRET.toString(), { expiresIn: '86400s' });
                // console.log(token);
                // console.log(dataItem);
                if (role == 'student') {
                    const student = await Student.find({ email: dataItem[0].email }).select({ rollNo: 1, _id: 0 })
                    res.status(200).json({ accessToken: token, rollNo: student[0].rollNo });
                }
                else if (role == 'admin') {
                    // console.log("admin");
                    const admin = await Admin.find({ email: dataItem[0].email }).select({ adminId: 1, _id: 0 })
                    res.status(200).json({ accessToken: token, adminId: admin[0].adminId });
                }
                else if (role == 'faculty') {
                    const faculty = await Faculty.find({ email: dataItem[0].email }).select({ facultyId: 1, _id: 0 })
                    // console.log(faculty[0].facultyId);
                    res.status(200).json({ accessToken: token, facultyId: faculty[0].facultyId });
                }
                else {
                    res.json({ message: "Invalid role.." })
                }
            }
            catch (error) {
                return res.status(400).json({ error: error });
            }

        }
        "admin"
    }
    catch (error) {
        return res.send(error)
    }
})

// Promoting the batch
router.put('/promote-batch', verifyToken, async (req, res) => {
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


// For dropdown..
// add assignment..
// {cat1:true,cat2:false}


var dropDown = { "cat1": false, "cat2": false, "sem": false, "lab": false, "assignment": false, "attendance": false }
var dropDownUpdated = dropDown;

router.put('/edit-dropdown', verifyToken, (req, res) => {
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

router.get('/get-dropdown', verifyToken, (req, res) => {
    if (req.user.role == 'faculty') {
        try {
            res.json({ dropDown: dropDownUpdated })
        } catch (error) {
            res.send(error)
        }
    }
    else {
        res.status(401).json({ message: "unauthorized" })
    }
})


module.exports = router;

