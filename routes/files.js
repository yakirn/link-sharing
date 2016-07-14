var express = require('express'),
    multer  = require('multer'),
    fs = require('fs'),
    router = express.Router(),
    s3Storage = require('../modules/storage'),
    secureSlug = require('../modules/secureSlug'),
    storage = multer.diskStorage({
        filename: function(req, file, cb){
            cb(null, 'LinkSharing' + file.fieldname + '-' + Date.now());
        }
    }),
    upload = multer({storage: storage}),
    config = require('../config'),
    server_base_address = config['server_base_address'];
/*
    *   This route handles file uploads using multer package and responds with a url to retreive the file.
    *   params:
    *       fileupload - The file [Mandatory].
    *       password - A pssword to provide with the link [Optional]
    *   returns an object in the form of {status: "success", link: "http://link.to.file/withahardtoguessslug"}
*/
router.post('/', upload.single('fileupload'), function(req, res, next){
    var originalFileName = req.file.originalname,
        password = req.body.password,
        filePath = req.file.path;

    //TODO: Consider compress files to reduce storage and network costs (Will increas server load though)
    s3Storage.save(filePath, originalFileName, function(err, storeFileKey){
        //TODO: better error handling and don't send original error to client.
        if(err){
            console.log(err)
            res.status(500).json(err)
        }
        else {
        const slug = 'files/' + secureSlug.generate(storeFileKey, password)
            res.json({status: 'success', link: server_base_address + slug, slug: slug})
        }

        // Deleting the temp file, it's safe in the cloud now
        fs.unlinkSync(filePath);
    })
});

/*
    This route handles files downloads request. Usage example:
    curl --data 'password=yourPassword' http://link.from.upload/...
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
        const [time, slugPassword, fileKey] = secureSlug.parse(req.params.file),
            requestPassword = req.body.password || '';

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
        var fileStream = s3Storage.getReadStream(fileKey);
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

module.exports = router;
