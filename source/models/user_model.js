const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema(
    {  
        rollNo :{
            type:String,
            required:true
        },
        name :{
            type:String,
            required:true
        },
        admissionNo :{
            type:String,
            required:true
        },
        DOB:{
            type:Date,
            required:true
        },
        department :{
            type:String,
            enum: ['AI&DS','AU', 'AE','BT','CE','CSE','ECE','EEE',,'FT', 'IT', 'ISE','TT' ],
            default:'IT',
            required:true
        },
        email :{
            type:String,
            required:true
        },
        batchYear:{
            type:Number,
            min:2020,
            required:true
        },
        addressLine1 :{
            type:String,
            required:true
        },
        addressLine2 :{
            type:String,
            required:true
        },
        city :{
            type:String,
            required:true
        },
        state :{
            type:String,
            required:true
        },
        parentName :{
            type:String,
            required:true
        },
        phoneNum :{
            type:String,
            required:true,
            maxLength :12,
            minLenngth:9
        },

    }
)

const Student = mongoose.model('Student', studentSchema);



const facultySchema = new mongoose.Schema(
    {
        facultyId :{
            type:String,
            required:true
        },
        name :{
            type:String,
            required:true
        },
        DOB:{
            type:Date,
            required:true
        },
        DOJ:{
            type:Date,
            required:true
        },
        department :{
            type:String,
            enum: ['AI&DS','AU', 'AE','BT','CE','CSE','ECE','EEE',,'FT', 'IT', 'ISE','TT' ],
            default:'IT',
            required:true
        },
        email :{
            type:String,
            required:true
        },
        addressLine1 :{
            type:String,
            required:true
        },
        addressLine2 :{
            type:String,
            required:true
        },
        city :{
            type:String,
            required:true
        },
        state :{
            type:String,
            required:true
        },
        phoneNum :{
            type:String,
            required:true,
            maxLength :12,
            minLenngth:9
        },

    }
)

const Faculty = mongoose.model('Faculty', facultySchema);



const CourseSchema = new mongoose.Schema({
    _id:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    semNo:{
        type:Number,
        requied:true
    },
    offeredBy:{
        type:String,
        required:true
    },
    hours:{
        type:Number,
        required:true
    },
    credits:{
        type:Number,
        required:true
    },
    facultyId:{
        type:String,
        required:true
    }
})

const Course = mongoose.model('Course', CourseSchema);


module.exports = {Student,Faculty,Course}