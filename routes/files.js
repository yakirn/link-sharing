var express = require('express');
var multer  = require('multer');
var storage = multer.diskStorage({
    filename: function(req, file, cb){
        cb(null, 'LinkSharing' + file.fieldname + '-' + Date.now());
    }
 })
var upload = multer({storage: storage}),
    router = express.Router(),
    base64url = require('base64-url'),
    AWS = require('aws-sdk'),
    fs = require('fs');

router.post('/', upload.single('thefile'), function(req, res, next){
    var s3 = new AWS.S3(),
        filePath = req.file.path;
    fs.readFile(filePath, function(err, data){
      if (err) { sendError(res, err, 'failed to read file bucket'); return;}
      var storeFileName = generateStoreFileName(req.file.originalname);
      s3.putObject({
          Bucket: 'lsfirstbucket',
          Key: storeFileName,
          ACL: 'private',
          ServerSideEncryption: 'AES256',
          Body: data
      }, function(err, data) {
          if (err) { sendError(res, err, 'failed to put object'); return;}

          else res.json({status: 'success', slug: base64url.encode(storeFileName)})

          fs.unlinkSync(filePath);
      });

    });
})
function generateStoreFileName(originalFileName){
    var now = new Date(),
        folder = ''.concat(now.getUTCFullYear(), '-', now.getUTCMonth()+1, '-', now.getUTCDate(), '/');
    return folder.concat(now.getTime(), '__', originalFileName)
}

router.get('/:file', function(req, res, next) {
        var d = require('domain').create()
        d.on('error', function(e){
            if(e.statusCode)
                res.sendStatus(e.statusCode);
            else {
                res.status(500).json(e.message || 'Internal server error');
            }
        })
        d.run(function(){
            var s3 = new AWS.S3(),
                fileKey = base64url.decode(req.params.file),
                params = {
                    Bucket: 'lsfirstbucket',
                    Key: fileKey
                };

            res.attachment(fileKey);
            var fileStream = s3.getObject(params).createReadStream();
            fileStream.pipe(res);
        })

})

function sendError(res, err, a){
    res.status(500).json(a ? Object.assign({a}, err) : err)
}

module.exports = router;
