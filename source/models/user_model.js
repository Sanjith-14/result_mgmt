const mongoose = require('mongoose')



//  Result Schema starts..
const subjectSchema = new mongoose.Schema({
    cat1:{
        type:Number,
        required:true
    },
    cat2:{
        type:Number,
        required:true
    },
    sem:{
        type:Number,
        required:true,
    },
    lab:{
        type:Number
    },
    assignment:{
        type:Number
    },
    grade:{
        type:String,
        // required:true
    }
})

const courseWithMarks = new mongoose.Schema({
    courseId:{
        type:String,
        required:true
    },
    marks:{
        type:subjectSchema,
        required:true
    }
})

const semesterSchema = new mongoose.Schema({
    semNo:{
        type:Number,
        required:true
    },
    subjectMarks :{
        type : [courseWithMarks] ,
        // type:[subjectSchema],
        required:true
    }
})

// Result Schema ends..



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
            enum: ['AD','AU', 'AE','BT','CE','CS','EC','EE',,'FT', 'IT', 'IS','TT' ],
            default:'IT',
            required:true
        },
        email :{
            type:String,
            required:true
        },
        batchYear:{
            type:String,
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
        country :{
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
        parentNum :{
            type:String,
            required:true,
            maxLength :12,
            minLenngth:9
        },
        result :{
            type:[semesterSchema],
            default:[],
        }

    }
)

const Student = mongoose.model('Student', studentSchema);


// Faculty Schema
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
            enum: ['AD','AU', 'AE','BT','CE','CS','EC','EE',,'FT', 'IT', 'IS','TT' ],
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
        country :{
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


//Admin Schema
const adminSchema = new mongoose.Schema(
    {
        adminId :{
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
        country :{
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

const Admin = mongoose.model('Admin',adminSchema)


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
    type:{
        type :String,
        enum: ['Theory','Embedded', 'Lab' ],
        required:true,
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
        // ref:Faculty,
        required:true
    }
})

const Course = mongoose.model('Course', CourseSchema);


const batchSchema = new mongoose.Schema({
    batchYear:{
        type:String,
        min:2020,
        required:true
    },
    dept:{
        type:String,
        required:true
    },
    currentSem:{
        type:Number,
        required:true
    },
    // classAdvisor:{
    //     type:String,
    //     required:true,
    //     ref : Faculty  //foreign key..
    // },
    students:{
        type:Array,
        default: [] ,
        required:true
    },
    currentCourses:{
        type:Array,
        default:[],
        required:true
    }
})

const Batch = mongoose.model('Batch',batchSchema)


// Enrollment..
const enrollSchema = new mongoose.Schema({
    batchYear:{
        type:String,
        required:true
    },
    department:{
        type:String,
        required:true
    },
    courseId:{
        type:String,
        required:true
    },
    courseName:{
        type:String,
        required:true
    },
    facultyId:{
        type:String,
        requied:true
    },
    semNo:{
        type:Number,
        required:true
    },
    isCompleted:{
        type:Boolean,
        default:false
    }
})

const Enrollment = mongoose.model('Enroll',enrollSchema)


const credentialSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true,
        enum: ['admin','faculty', 'student']
    }
})

const Credential = mongoose.model('Credential',credentialSchema)

module.exports = {Student,Faculty,Course,Batch,Enrollment,Credential,Admin}