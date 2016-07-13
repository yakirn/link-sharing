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
/*
    *   This route handles file uploads using multer package and responds with a url to retreive the file.
    *   TODO:
    *       1) Handle passwords
            2) Create read stream instead of readFile: http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-examples.html#Amazon_S3__Uploading_an_arbitrarily_sized_stream__upload_
    *       3) Consider streaming directly to s3 without saving it to the file system first by
                replacing multer with node-multiparty, see https://github.com/andrewrk/node-multiparty/blob/master/examples/s3.js
                this approach needs more research regarding performance when handling large files
            4) Alternatively, Provide a form to directly upload to s3 http://aws.amazon.com/articles/1434
                this approach is probably the best in terms of efficiency and scalability, but it makes the API harder to consume
            5) Alternatively, Force to upload large files in chunks, upload to s3 by appending each chunk.
*/
router.post('/', upload.single('fileupload'), function(req, res, next){
    var s3 = new AWS.S3(),
        filePath = req.file.path;
    fs.readFile(filePath, function(err, data){
      if (err) { sendError(res, err, 'failed to read file bucket'); return;}
      var storeFileKey = generateStoreKey(req.file.originalname);
      s3.putObject({
          // TODO: Get bucket name from config, save original file name as meta
          Bucket: 'lsfirstbucket',
          Key: storeFileKey,
          ACL: 'private',
          ServerSideEncryption: 'AES256',
          Body: data
      }, function(err, data) {
          if (err) { sendError(res, err, 'failed to put object'); return;}

          //TODO: Find a way to get the base address from code or use config
          else res.json({status: 'success', link: 'http://localhost:8080/files/' + getSecureSlug(storeFileKey)})

          fs.unlinkSync(filePath);
      });

    });
})
/*
    *   creates a name in the following format:
    *   YYYY-MM-DD/<Unix time in ms>__originalFileName
    *   TODO:
    *       1) Do no relay on original file's name. instead generate a random string.
*/
function generateStoreKey(originalFileName){
    var now = new Date(),
        folder = now.toISOString().split('T')[0];
    return folder.concat('/',now.getTime(), '__', originalFileName)
}

/*
    *   Creates a url safe string that is hard to guess
    *   TODO:
    *       1) Considet pad short file names with a random string so they would be harder to guess.
    *       2) Encrypt the file name before base64 encoding
*/
function getSecureSlug(fileName){
    return base64url.encode(fileName)
}

router.post('/:file', function(req, res, next) {
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
                fileKey = getStorageKeyFromSlug(req.params.file),
                params = {
                    Bucket: 'lsfirstbucket',
                    Key: fileKey
                };
            var dsIndex = fileKey.indexOf('/');
            if(dsIndex == -1) {
                res.sendStatus(400)
                return;
            }
            var keyParams = fileKey.substring(dsIndex + 1).split('__');
            if(!isKeyValidDate(keyParams[0])) {
                res.status(403).json({reason: 'Link expired'})
                return;
            }
            // TODO: extract original file name from meta, and use it instead of the key
            //          (So that the user will get the same file name when downloading)
            res.attachment(fileKey);
            var fileStream = s3.getObject(params).createReadStream();
            fileStream.pipe(res);
        })

})

/*
    *   Check that the date is a valid Unix timestamp,
        and that it is not a future date, nor older than 24h.
*/
var ONE_DAY = 24 * 60 * 60 * 1000;
function isKeyValidDate(key){
    var parsedTime = Number(key),
        now = Date.now()
    return !isNaN(parsedTime) && now > parsedTime &&  now < parsedTime + ONE_DAY
}

function getStorageKeyFromSlug(slug){
    return base64url.decode(slug);
}

function sendError(res, err, a){
    res.status(500).json(a ? Object.assign({a}, err) : err)
}

module.exports = router;
