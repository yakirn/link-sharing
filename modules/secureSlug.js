var crypto = require('crypto'),
    crypt_algorithm = 'aes-256-ctr',
    //TODO: store password in a safe place, outsice source control
    server_password = 'rny68WsXQBGvKnK8';


module.exports = {
    /*
        *   Creates a url safe string that is hard to guess
        *   TODO:
        *       1) Considet pad short file names with a random string so they would be harder to guess.
        *       2) Or better yet, do not use the file name at all
    */
    generate: function(fileName, password){
        return encrypt([Date.now(), password, fileName].join('&&&&'))
    },

    parse: function(slug) {
        var result = []
        try {
            result = decrypt(slug).split('&&&&');
            console.log(result)
        } catch (e) {
            console.log(slug, e)
        } finally {
            return result
        }
    }
}

function encrypt(text){
  var cipher = crypto.createCipher(crypt_algorithm, server_password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text){
  var decipher = crypto.createDecipher(crypt_algorithm, server_password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}
