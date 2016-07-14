var crypto = require('crypto'),
    config = require('../config'),
    crypt_algorithm = config['crypt_algorithm'],
    //TODO: store password in a safe place, outside source control
    server_password = config['server_password'],
    slug_split_string = config['slug_split_string'];

module.exports = {
    /*
        *   Creates a url safe string that is hard to guess
        *   TODO:
        *       To make it harder for attackers to fake links, and get access to expired links
        *       Do not save the file in it's original name (needs support from the storage module)
        *       Instead use a random string and the timestamp
        *       Use the timestamp to retrive the file, this way fake timestamps will not mach to a file
        *       Then, instead of encrypting everything, we could just hash the password.
    */
    generate: function(fileName, password){
        return encrypt([Date.now(), password, fileName].join(slug_split_string))
    },

    parse: function(slug) {
        var result = []
        try {
            result = decrypt(slug).split(slug_split_string);
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
