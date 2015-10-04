var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({
  dest: 'uploads/'
});
var MailParser = require("mailparser").MailParser;
var fs = require("fs");
var mailparser = new MailParser();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/upload", upload.single("email"), function(req, res, next) {
  mailparser.on("end", function(mail){
    // create a resume to DB and redirect to show it
    res.redirect();
    res.render("employees/index", {
      mail: mail
    });
  });

  fs.createReadStream(req.file.path).pipe(mailparser);
});

module.exports = router;
