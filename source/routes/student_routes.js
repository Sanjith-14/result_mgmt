const express = require('express')
const studentRouter = express.Router()
const jwt = require("jsonwebtoken");

const item = require('../models/user_model')
const Student = item.Student
const Faculty = item.Faculty
const Course = item.Course
const Batch = item.Batch
const Enrollment = item.Enrollment
const Credential = item.Credential

const verifyToken = require("../../middleware/verifyToken");

studentRouter.use(express.json());
studentRouter.use(express.urlencoded({ extended: true }));

// get roll no by decrypt token
// To get result for particular student..
studentRouter.get('/result/:RollNo', verifyToken, async (req, res) => {
    try {
        var rollNo = req.params.RollNo;
        const dataItem = await Student.find({ rollNo: rollNo }).select({ result: 1, SGPA: 1, CGPA: 1 })
        if (dataItem.length == 0) {
            res.status(200).json({
                message: "No students are there"
            })
        }
        else {
            res.status(200).json({
                result: dataItem[0].result,
                SGPA: dataItem[0].SGPA,
                CGPA: dataItem[0].CGPA
            })
        }

    }
    catch (error) {
        return res.send(error)
    }
})

module.exports = studentRouter;