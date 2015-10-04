var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({
  dest: 'uploads/'
});
var MailParser = require("mailparser").MailParser;
var fs = require("fs");
var path = require("path");
var cheerio = require("cheerio");
var AdmZip = require("adm-zip");
var models = require("../models");
var Employee = models.Employee;
var Resume = models.Resume;

router.get('/', function(req, res, next) {
  Employee.findAll({
    order: [
      ["id", "desc"]
    ]
  }).then(function(employees){
    res.render("index", {
      employees: employees
    });
  });
});

router.post("/upload", upload.single("email"), function(req, res, next) {
  var ext = req.file.originalname.slice(-4);

  if (ext === '.eml') {
    storeEmailToDatabase(req.file.path, function(id){
      res.redirect("/employees/" + id);
    });
  } else if (ext === '.zip') {
    var zip = new AdmZip(req.file.path);
    var directory = "uploads/d_" + req.file.filename;

    fs.mkdirSync(directory);
    zip.extractAllTo(directory);

    var files = fs.readdirSync(directory);

    files.forEach(function(file){
      storeEmailToDatabase(path.join(directory, file));
    });
  }
});

function storeEmailToDatabase(path, callback){
  var mailparser = new MailParser();

  mailparser.on("end", function(mail){
    var $ = cheerio.load(mail.html);
    var name = $("strong > a > span").text();
    var email = $("tr:nth-child(6) > td:nth-child(2) > font > a").text();
    var content = $("body").html();
    var date = mail.date;

    Employee.findOne({
      where: {
        email: email
      }
    }).then(function(employee){
      if(employee){
        return employee;
      }else{
        return Employee.create({
          name: name,
          email: email
        });
      }
    }).then(function(employee){
      return [
        employee,
        Resume.create({
          content: content,
          employeeId: employee.id,
          receiveAt: date
        })
      ];
    }).spread(function(employee, resume){
      return employee.update({
        newestResumeId: resume.id,
        newestResumeDate: resume.receiveAt
      });
    }).then(function(employee){
      if(callback){
        callback(employee.id);
      }
    });
  });

  fs.createReadStream(path).pipe(mailparser);
}

module.exports = router;
