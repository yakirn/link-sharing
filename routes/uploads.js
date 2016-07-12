var express = require('express');
var multer  = require('multer');
var storage = multer.diskStorage({
    filename: function(req, file, cb){
        cb(null, 'aaaaaaa' + file.fieldname + '-' + Date.now());
    }
 })
var upload = multer({storage: storage});
var router = express.Router();
var AWS = require('aws-sdk'),
    fs = require('fs');

router.post('/', upload.single('thefile'), function(req, res, next){
    var s3 = new AWS.S3(),
        filePath = req.file.path;
    fs.readFile(filePath, function(err, data){
      if (err) { sendError(res, err, 'failed to read file bucket'); return;}

      s3.putObject({
          Bucket: 'lsfirstbucket',
          Key: req.file.filename,
          Body: data
      }, function(err, data) {
          if (err) { sendError(res, err, 'failed to put object'); return;}
          else res.json(data)

          fs.unlinkSync(filePath);
      });

    });
})

function sendError(res, err, a){
    res.status(500).json(Object.assign({a}, err))
}

module.exports = router;
