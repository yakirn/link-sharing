var express = require('express'),
    multer  = require('multer'),
    storage = multer.diskStorage({
    filename: function(req, file, cb){
        cb(null, 'LinkSharing' + file.fieldname + '-' + Date.now());
    }
}),
    upload = multer({storage: storage}),
    router = express.Router(),
    // base64url = require('base64-url'),
    AWS = require('aws-sdk'),
    fs = require('fs'),
    crypto = require('crypto'),
    crypt_algorithm = 'aes-256-ctr',
    //TODO: store password in a safe place, outsice source controle
    server_password = 'rny68WsXQBGvKnK8';
/*
    *   This route handles file uploads using multer package and responds with a url to retreive the file.
    *   params:
    *       fileupload - The file [Mandatory].
    *       password - A pssword to provide with the link [Optional]
    *   returns an object in the form of {status: "success", link: "http://link.to.file"}
    *   TODO:
    *       1) Consider streaming directly to s3 without saving it to the file system first by
                replacing multer with node-multiparty, see https://github.com/andrewrk/node-multiparty/blob/master/examples/s3.js
                this approach needs more research regarding performance when handling large files
            2) Alternatively, Provide a form to directly upload to s3 http://aws.amazon.com/articles/1434
                this approach is probably the best in terms of efficiency and scalability, but it makes the API harder to consume
            3) Alternatively, Force to upload large files in chunks, upload to s3 by processing small chunks in memmory and appending each chunk.
            4) Validate parameters
*/
router.post('/', upload.single('fileupload'), function(req, res, next){
    var originalFileName = req.file.originalname,
        password = req.body.password,
        filePath = req.file.path,
        storeFileKey = generateStoreKey(originalFileName),
        s3obj = new AWS.S3({ params: {
            // TODO: Get bucket name from config, save original file name as meta
            Bucket: 'lsfirstbucket',
            Key: storeFileKey,
            ACL: 'private',
            ServerSideEncryption: 'AES256'
        }}),
        //TODO: Consider compress files to reduce storage and network costs (Will increas server load though)
        body = fs.createReadStream(filePath);
        body.on('error', function(e){
            console.log(e)
            //TODO: Send details only in development
            res.status(500).json({message: 'Failed to read file.', details: e.message})
        })
        s3obj.upload({Body: body}).
              send(function(err, data) {
                  if (err) {
                      console.log(err)
                      if(!res.headerSent)
                        res.status(500).json({message: 'Failed to upload file to storage.', details: err.message})
                  }

                  //TODO: Find a way to get the base address from code or use config
                  else res.json({status: 'success', link: 'http://localhost:8080/files/' + getSecureSlug(storeFileKey, password)})

                  fs.unlinkSync(filePath);
              });
});
/*
    *   creates a name in the following format:
    *   YYYY-MM-DD/<Unix time in ms>__originalFileName
    *   TODO:
    *       1) Do no relay on original file's name. instead generate a random string.
*/
function generateStoreKey(originalFileName){
    var folder = new Date().toISOString().split('T')[0];
    return folder.concat('/', originalFileName)
}

/*
    *   Creates a url safe string that is hard to guess
    *   TODO:
    *       1) Considet pad short file names with a random string so they would be harder to guess.
*/
function getSecureSlug(fileName, password){
    return encrypt([Date.now(), password, fileName].join('&&&&'))
}

function encrypt(text){
  var cipher = crypto.createCipher(crypt_algorithm, server_password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

/*
    This route handles files downloads request. Usage example:
    curl --data 'password=yourPassword' http://link.from.upload
    TODO:
        *   Consider accepting password in header and change verb to GET, to be more RESTful
        *   We can return a "one time" link instead of streaming the file. This will reduce server load.
*/
router.post('/:file', function(req, res, next) {
        var d = require('domain').create()
        d.on('error', function(e){
            console.log(e)
            if(e.statusCode)
                res.sendStatus(e.statusCode);
            else {
                res.status(500).json(e.message || 'Internal server error');
            }
        })
        d.run(function(){
            const [time, slugPassword, fileKey] = getPartsFromSlug(req.params.file),
                requestPassword = req.body.password || '',
                s3 = new AWS.S3({params: {
                    Bucket: 'lsfirstbucket',
                    Key: fileKey
                }});
            if(!(time && fileKey)){
                res.sendStatus(400)
                return;
            }
            if(isExpired(time)) {
                res.status(403).json({reason: 'Link expired'})
                return;
            }
            if(slugPassword !== requestPassword){
                res.status(401).json({reason: 'Invalid password'})
                return;
            }
            // TODO: extract original file name from meta, and use it instead of the key
            //          (So that the user will get the same file name when downloading)
            res.attachment(fileKey);
            var fileStream = s3.getObject().createReadStream();
            fileStream.pipe(res);
        })

})

/*
    *   Check that the date is a valid Unix timestamp,
        and that it is not a future date, nor older than 24h.
*/
var ONE_DAY = 24 * 60 * 60 * 1000;
function isExpired(key){
    var parsedTime = Number(key),
        now = Date.now()
    return isNaN(parsedTime) || now < parsedTime ||  now > parsedTime + ONE_DAY
}

function getPartsFromSlug(slug){
    var result = []
    try {
        result = decrypt(slug).split('&&&&');
    } catch (e) {
        console.log(slug, e)
    } finally {
        return result
    }
}

function decrypt(text){
  var decipher = crypto.createDecipher(crypt_algorithm, server_password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

module.exports = router;
