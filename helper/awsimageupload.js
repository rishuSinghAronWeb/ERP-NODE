var multer = require('multer');
var multerS3 = require('multer-s3');
var aws = require('aws-sdk');

aws.config.update({
  // Your SECRET ACCESS KEY from AWS should go here,
  secretAccessKey: '4vROUcxHkD6wrKrXRocMjJL8Rw4A7JtNo6QdLjmh',
  // Not working key, Your ACCESS KEY ID from AWS should go here,
  accessKeyId: 'AKIARMMSRAXD36Y2RCM3',
  region: 'ap-south-1' // region of your bucket
});

// console.log('console',config)
var s3 = new aws.S3();

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'erparon-1',
    contentLength: 500000000,
    acl: 'public-read',
    metadata: function (req, file, cb) {
        console.log('file',file)
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        console.log('file.originalname',file.originalname)
      cb(null, Date.now().toString() + file.originalname)
    }
  })
});

module.exports = upload;