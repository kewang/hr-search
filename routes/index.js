var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({
  dest: 'uploads/'
});
var MailParser = require("mailparser").MailParser;
var fs = require("fs");
var cheerio = require("cheerio");
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
  var mailparser = new MailParser();

  mailparser.on("end", function(mail){
    var $ = cheerio.load(mail.html);
    var name = $("strong > a > span").text();
    var email = $("tr:nth-child(6) > td:nth-child(2) > font > a").text();
    var content = $("body").html();

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
          EmployeeId: employee.id
        })
      ];
    }).spread(function(employee, resume){
      return employee.update({
        newestResumeId: resume.id
      });
    }).then(function(employee){
      res.redirect("/employees/" + employee.id);
    });
  });

  fs.createReadStream(req.file.path).pipe(mailparser);
});

module.exports = router;
