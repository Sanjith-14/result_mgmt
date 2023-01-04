const express = require('express')
const router = express.Router()
const jwt = require("jsonwebtoken");
// For accessing the variables in .env files..
const dotenv = require('dotenv')
dotenv.config()

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const verifyToken = require("../../middleware/verifyToken");


//Getting ready(Home page)..
router.get('/', async (req, res) => {
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
            const credential = await Credential.findOneAndUpdate({ email: email }, { password: updatedpassword })
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

router.get('/check-email', async (req, res) => {
    try {
        const email = req.body.email
        const credential = await Credential.find({ email: email }).select({ email: 1 })
        if (credential.length == 0) {
            res.status(200).json({
                message: "Invalid email"
            })
        }
        else {
            res.status(200).json({
                message: "Correct email"
            })
        }
    }
    catch (error) {
        res.status(401).send(error)
    }
})


//To get the detail of particular student
router.get('/student-detail/:rollNo', verifyToken, async (req, res) => {
    try {
        if (req.user.role == "faculty" || req.user.role == "admin" || req.user.role == "student") {
            var rollNo = req.params.rollNo;
            const dataItem = await Student.find({ rollNo: rollNo }).select({ result: 0, CGPA: 0, SGPA: 0 })
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




router.get('/course/:courseId', verifyToken, async (req, res) => {
    try {
        // console.log(req.params.courseId)
        const dataItem = await Course.find({ _id: req.params.courseId })
        // console.log(dataItem)
        if (dataItem.length == 0) {
            res.json({
                course: []
            })
        }
        // console.log(dataItem.length())
        else {
            res.status(200).json({
                course: dataItem[0]
            })
        }
    }
    catch (error) {
        return res.send(error)
    }
})


// Current course for students..
router.get('/current-course', verifyToken, async (req, res) => {
    try {
        const rollNo = req.body.rollNo
        const student = await Student.find({rollNo:rollNo}).select({batchYear:1,department:1})
        const batchYear = student[0].batchYear
        const dept = student[0].department
        const dataItem = await Batch.find({ batchYear:batchYear , dept:dept }).select({currentCourses:1})
        if (dataItem.length == 0) {
            res.json({
                currentCourse: []
            })
        }
        // console.log(dataItem.length())
        else {
            res.status(200).json({
                currentCourse: dataItem[0].currentCourses
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
    }
    catch (error) {
        return res.send(error)
    }
})


router.get('/get-dropdown', verifyToken, (req, res) => {
    if (req.user.role == 'faculty' || req.user.role == 'admin') {
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