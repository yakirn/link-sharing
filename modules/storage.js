var AWS = require('aws-sdk'),
    fs = require('fs'),
    randomstring = require('randomstring');


module.exports = {
    save: function(tempFilePath, originalFileName, cb){
        var storeFileKey = generateStoreKey(originalFileName),
        s3obj = new AWS.S3({ params: {
                    // TODO: Get bucket name from config, save original file name as meta
                    Bucket: 'lsfirstbucket',
                    Key: storeFileKey,
                    ACL: 'private',
                    ServerSideEncryption: 'AES256'
                }}),
                //TODO: Consider compress files to reduce storage and network costs (Will increas server load though)
                body = fs.createReadStream(tempFilePath);
                body.on('error', function(err){
                    cb(err)
                })
                s3obj.upload({Body: body, Metadata: { 'original-file-name': originalFileName }}).
                      send(function(err, data) {
                          if (err) { cb(err); return; }

                          cb(undefined, storeFileKey, data)

                        //   fs.unlinkSync(tempFilePath);
                      });
    },

    getReadStream: function(fileKey){
        var s3 = new AWS.S3({params: {
                            Bucket: 'lsfirstbucket',
                            Key: fileKey
                        }});
        // TODO: We are making two calls, one for the headers and one for the object stream
        //          There must be a better way, without downloading the entire object
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
