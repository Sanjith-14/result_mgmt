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
            enum: ['AD','AU', 'AE','BT','CE','CS','EC','EE',,'FT', 'IT', 'IS','TT' ],
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
        parentNum :{
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


const batchSchema = new mongoose.Schema({
    batchYear:{
        type:Number,
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
    courses:{
        type:Array,
        default:[],
        required:true
    }
})

const Batch = mongoose.model('Batch',batchSchema)


module.exports = {Student,Faculty,Course,Batch}