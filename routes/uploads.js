var express = require('express');
var multer  = require('multer');
var storage = multer.diskStorage({
    filename: function(req, file, cb){
        cb(null, 'aaaaaaa' + file.fieldname + '-' + Date.now());
    }
 })
var upload = multer({storage: storage});
var router = express.Router();

router.post('/', upload.single('thefile'), function(req, res, next){
    res.json({path: req.file.path, password: req.body.password})
})

module.exports = router;
