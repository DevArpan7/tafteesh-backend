const express = require('express')
const app = express()
const fileUploadRouter = express.Router()
const path = require('path')

//multer
const multer  = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, `KAMO_${Date.now()}_${file.originalname}`)
    }
})

const acceptedFileTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (!acceptedFileTypes.includes(file.mimetype)) {
            return cb({
                message: 'Only .png, .jpg, .jpeg, .pdf, .doc, .docx format allowed!'
            })
        }
        cb(null, true)
    }
}).single('file') /** Formadata key should be "file" */

/**
 * single file upload
 */
fileUploadRouter.post('/upload', function (req, res, next) {
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            // handle error
            res.send({error: true, message: 'Multer error', data: err})
        } else if (err) {
            // handle error
            res.send({error: true, message: 'Something went wrong', data: err})
        } else {
            // write you code
            if (req.file) {
                const file = req.file;
                console.log(file);
                if (!file) {
                    res.send('Please upload a file')
                }

                filePath = path.join(file.filename);
                console.log(filePath);
                res.send({error: false, message: 'File uploaded', data:{file,filePath}})
            } else {
                res.send({error: true, message: 'File can not be empty'})
            }
        }
    })
})

module.exports = fileUploadRouter