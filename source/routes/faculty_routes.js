const express = require('express')
const facultyRouter = express.Router()
const jwt = require("jsonwebtoken");

const item = require('../models/user_model')
const Student = item.Student
const Faculty = item.Faculty
const Course = item.Course
const Batch = item.Batch
const Enrollment = item.Enrollment
const Credential = item.Credential
const verifyToken = require("../../middleware/verifyToken");

facultyRouter.use(express.json());
facultyRouter.use(express.urlencoded({ extended: true }));


facultyRouter.get('/get-mark', verifyToken, async (req, res) => {
    try {
        const batchYear = req.body.batchYear
        const dept = req.body.dept
        const sem = req.body.sem
        const courseId = req.body.courseId
        const examType = req.body.examType

        const studentRollNo = []
        const marks = []
        // console.log(examType)
        const data = await Batch.find({ batchYear: batchYear, dept: dept }).select({ students: 1 })

        // console.log(data[0])
        for (let i = 0; i < data[0].students.length; i++) {
            // console.log(data[0].students[i])
            // data[0].students.forEach(async (studs)=>{
            studentRollNo[i] = data[0].students[i]
            const student = await Student.find({ rollNo: studentRollNo[i] }).select({ name: 1, rollNo: 1, result: 1 })
            // console.log(student[0].result[sem-1].subjectMarks)
            for (let j = 0; j < student[0].result[sem - 1].subjectMarks.length; j++) {
                if (student[0].result[sem - 1].subjectMarks[j].courseId == courseId) {
                    if (examType == "cat1") {
                        marks[i] = student[0].result[sem - 1].subjectMarks[j].marks.cat1
                    }
                    else if (examType == "cat2") {
                        marks[i] = student[0].result[sem - 1].subjectMarks[j].marks.cat2
                    }
                    else if (examType == "sem") {
                        marks[i] = student[0].result[sem - 1].subjectMarks[j].marks.sem
                    }
                    else if (examType == "lab") {
                        marks[i] = student[0].result[sem - 1].subjectMarks[j].marks.lab
                    }
                    else if (examType == "assignment") {
                        marks[i] = student[0].result[sem - 1].subjectMarks[j].marks.assignment
                    }
                    else if (examType == "attendance") {
                        marks[i] = student[0].result[sem - 1].subjectMarks[j].marks.attendance
                    }
                }
            }
            // })
        }
        if (marks.length == 0) {
            res.status(401).json({ message: "Invalid Course id / examType" })
        }
        else {
            res.json({
                studentRollNo: studentRollNo,
                marks: marks
            })
        }
    } catch (error) {
        res.status(401).send(error)
    }

})


// Get all students..
// by department , batch
facultyRouter.get('/students', verifyToken, async (req, res) => {
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



// Adding result to student
facultyRouter.put('/faculty-add-result', verifyToken, async (req, res) => {
    try {
        if (req.user.role == 'faculty') {
            // Give result structure to all students..
            // necessary details starts..
            const studRollNo = req.body.studRollNo   //array
            let examType = req.body.examType
            let courseId = req.body.courseId
            const currentSem = req.body.currentSem
            const marks = req.body.marks  //array
            const batchYear = req.body.batchYear

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
                }

                for (let i = 0; i < studRollNo.length; i++) {
                    // Calculating grade for the student
                    const student = await Student.find({ rollNo: studRollNo[i] }).select({ result: 1, _id: 0 })
                    const data = student[0].result[currentSem - 1].subjectMarks
                    var index;
                    for (let j = 0; j < data.length; j++) {
                        if (data[j].courseId == courseId) {
                            index = j
                            break;
                        }
                    }
                    // console.log("index" + index);

                    var gradeInt;

                    const temp = student[0].result[currentSem - 1].subjectMarks[index].marks
                    // console.log(student[0].result[currentSem-1].subjectMarks[index].marks)
                    var mark;

                    const subtype = await Course.find({ _id: courseId }).select({ type: 1, _id: 0 })
                    // console.log(subtype[0].type)

                    if (subtype[0].type == "theory" && temp.attendance > 75) {
                        mark = temp.cat1 * 0.4 + temp.cat2 * 0.4 + temp.sem * 0.4 + temp.assignment
                    }
                    else if (subtype[0].type == "theory" && temp.attendance < 75) {
                        mark = 10
                    }
                    else if (subtype[0].type == "embedded" && temp.lab > 50 && temp.attendance > 75) {
                        mark = (temp.cat1 * 0.4 + temp.cat2 * 0.4 + temp.sem * 0.4 + temp.assignment) * 0.6 + (temp.lab * 0.4)
                    }
                    else if (subtype[0].type == "embedded" && (temp.lab < 50 || temp.attendance < 75)) {
                        mark = 10
                    }
                    gradeInt = Math.ceil(mark / 10) - 1

                    // Update grade for a student
                    const response1 = await Student.updateOne(
                        { rollNo: studRollNo[i] },
                        { $set: { [setGrade]: grades[gradeInt] } },
                        { arrayFilters: [{ "resElement.semNo": currentSem }, { "subElement.courseId": courseId }] }
                    )

                }

                Enrollment.findOneAndUpdate({ courseId: courseId, department: studRollNo[0].substring(3, 5), batchYear: batchYear, semNo: currentSem }, { $set: { isCompleted: true } }).then(() => {
                    console.log("success")
                })

                for (let i = 0; i < studRollNo.length; i++) {
                    // upload cgpa to student
                    const student = await Student.find({ rollNo: studRollNo[i] }).select({ result: 1, _id: 0 })
                    let post = 1
                    const enroll = await Enrollment.find({ semNo: currentSem, department: studRollNo[i].substring(3, 5), batchYear: batchYear })
                    for (let k = 0; k < enroll.length; k++) {
                        if (enroll[k].isCompleted == false) {
                            post = 0;
                            break;
                        }
                    }
                    if (post == 1) {
                        let reGrade = [];
                        let sumGrad = 0
                        let sumCredits = 0
                        let x;
                        for (x = 0; x < student[0].result[currentSem - 1].subjectMarks.length; x++) {

                            var course = await Course.find({ _id: student[0].result[currentSem - 1].subjectMarks[x].courseId }).select({ credits: 1 })
                            var credit = course[0].credits
                            sumCredits += credit

                            reGrade[0] = student[0].result[currentSem - 1].subjectMarks[x].marks.grade
                            var grad = reGrade[0] == 'O' ? 10 : reGrade[0] == 'A+' ? 9 : reGrade[0] == 'A' ? 8 : reGrade[0] == 'B+' ? 7 : reGrade[0] == 'B' ? 6 : 0  //just no changes to o :-(
                            sumGrad += (grad * credit)
                        }
                        var sgpa = sumGrad / sumCredits
                        await Student.findOneAndUpdate({ rollNo: studRollNo[i] }, { $push: { SGPA: sgpa } }).then(() => {
                            console.log("added sgpa")
                        })

                        const stud = await Student.find({ rollNo: studRollNo[i] }).select({ SGPA: 1 })
                        const len = stud[0].SGPA.length
                        var sum = 0;
                        stud[0].SGPA.forEach(e => {
                            sum += e
                        });
                        const cgpa = sum / len
                        // console.log("CGPA : " + cgpa)

                        await Student.findOneAndUpdate({ rollNo: studRollNo[i] }, { $set: { CGPA: cgpa } }).then(() => {
                            console.log("added cgpa")
                        })

                    }
                }

                dropDownUpdated.sem = true
                res.json({
                    success: "Progress added successfully",
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
                success: "Progress added successfully",
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
facultyRouter.get('/courses/:facultyId', verifyToken, async (req, res) => {
    console.log(req.params.facultyId)
    try {
        if (req.user.role == 'faculty') {
            const dataItem = await Enrollment.find({ facultyId: req.params.facultyId })
            console.log(dataItem)
            if (dataItem.length == 0) {
                res.status(200).json({
                    classes: []
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

module.exports = facultyRouter