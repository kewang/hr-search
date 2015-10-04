var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({
  dest: 'uploads/'
});
var MailParser = require("mailparser").MailParser;
var fs = require("fs");
var mailparser = new MailParser();
var cheerio = require("cheerio");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/upload", upload.single("email"), function(req, res, next) {
  mailparser.on("end", function(mail){
    var $ = cheerio.load(mail.html);

    res.send({
      name: $("strong > a > span").text(),
      email: $("tr:nth-child(6) > td:nth-child(2) > font > a").text(),
      sex: $("table:nth-child(2) > tbody > tr > td:nth-child(1) > font").text()
    });

    // create a resume to DB and redirect to show it

    res.end();
  });

  fs.createReadStream(req.file.path).pipe(mailparser);
});

module.exports = router;
