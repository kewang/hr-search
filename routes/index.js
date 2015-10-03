var express = require('express');
var router = express.Router();
var multer = require('multer')
var upload = multer({
  dest: 'uploads/'
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/upload", function(req, res, next) {
  console.log(req.file);
  res.end();
});

module.exports = router;
