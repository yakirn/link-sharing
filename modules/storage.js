var AWS = require('aws-sdk'),
    fs = require('fs'),
    randomstring = require('randomstring'),
    config = require('../config'),
    bucket = config['s3-bucket-name'],
    ServerSideEncryption = config['ServerSideEncryption'];

module.exports = {
    save: function(tempFilePath, originalFileName, cb){
        var storeFileKey = generateStoreKey(originalFileName),
        s3obj = new AWS.S3({ params: {
                    // TODO: Get bucket name from config, save original file name as meta
                    Bucket: bucket,
                    Key: storeFileKey,
                    ACL: 'private',
                    ServerSideEncryption
                }}),
        //TODO: Consider compress files to reduce storage and network costs (Will increas server load though)
        body = fs.createReadStream(tempFilePath);
        body.on('error', function(err){
            cb(err)
        })
        s3obj.upload({Body: body, Metadata: { 'original-file-name': originalFileName }})
            .send(function(err, data) {
                if (err) { cb(err); return; }

                cb(undefined, storeFileKey, data)
            });
    },

    getReadStream: function(fileKey){
        var s3 = new AWS.S3({params: {
                            Bucket: bucket,
                            Key: fileKey
                        }});
        // TODO: If it is possible, get the object's meta and a stream in a single call
        //          This way, it would be possible not to rely on the file's name as the storage key
        //          and the client would be able to get his file with the original name.
        return s3.getObject().createReadStream()
    }
};

/*
    *   creates a name in the following format:
    *   YYYY-MM-DD/<Unix time in ms>__originalFileName
    *   TODO:
    *       1) Do no relay on original file's name. instead generate a random string.
*/
function generateStoreKey(originalFileName){
    var now = new Date(),
        folder = now.toISOString().split('T')[0];
    return folder.concat('/', now.getTime(), '-',  originalFileName)
}

// function generateStoreKey(){
//     var now = new Date(),
//         folder = now.toISOString().split('T')[0];
//     return folder.concat('/',now.getTime(), getRandomString())
// }
//
// function getRandomString(){
//     return randomstring.generate()
// }
