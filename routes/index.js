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
var bcrypt = require("bcrypt-nodejs");
var passport = require("passport");
var models = require("../models");
var Employee = models.Employee;
var Resume = models.Resume;
var User = models.User;

router.get('/', function(req, res, next) {
  Employee.findAll({
    order: [
      ["likes", "desc"],
      ["id", "desc"]
    ],
    include: [{
      model: Resume,
      as: "NewestResume",
      attributes: [
        "createdAt"
      ]
    }]
  }).then(function(employees){
    res.render("index", {
      employees: employees
    });
  });
});

router.post("/upload", upload.single("email"), function(req, res, next) {
  // Not upload file
  if (!req.file) {
    return res.redirect(req.headers.referer);
  }

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

    console.log("Parse start");

    files.forEach(function(file){
      var p = path.join(directory, file);

      console.log("Parse file: " + p);

      storeEmailToDatabase(p);
    });

    console.log("Parse end");

    res.redirect(req.headers.referer);
  }
});

router.get("/logout", function(req, res, next) {
  if(req.isAuthenticated()){
    req.logout();

    req.app.locals.isAuth = false;

    res.redirect(req.headers.referer);
  }
});

router.get("/login", function(req, res, next) {
  res.render("login");
});

router.post("/login", function(req, res, next) {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
  }, function(err, user, info) {
    if(err) {
      return res.render("/login", {title: 'Sign In', errorMessage: err.message});
    }

    if(!user) {
      return res.render("/login", {title: 'Sign In', errorMessage: err.message});
    }

    return req.login(user, function(err){
      if (err) {
        return res.render("/login", {title: 'Sign In', errorMessage: err.message});
      } else {
        return res.redirect('/');
      }
    });
  })(req, res, next);
});

router.get("/signup", function(req, res, next) {
  res.render("signup");
});

router.post("/signup", function(req, res, next) {
  User.findOne({
    where: {
      username: req.body.username
    }
  }).then(function(user) {
    if (user) {
      return res.render('signup', {title: 'Sign Up', errorMessage: 'username already exists'});
    }

    var password = req.body.password;
    var hash = bcrypt.hashSync(password);

    return User.create({
      username: req.body.username,
      password: hash
    });
  }).then(function(user) {
    return req.login(user, function(err){
      if (err) {
        return res.render("/login", {title: 'Sign In', errorMessage: err.message});
      } else {
        return res.redirect('/');
      }
    });
  });
});

function storeEmailToDatabase(path, callback){
  var mailparser = new MailParser();

  mailparser.on("end", function(mail){
    var $ = cheerio.load(mail.html);
    var src = $("img[src*=\"http://vip.104.com.tw/9/other/mail/img/icon_active\"]").parent().parent().parent();
    var name = src.find("strong > a > span").text().trim();
    var tmp = src.find("font").first().text().trim().split("　");
    var age = tmp[0].replace("歲", "");
    var gender = convertToGender(tmp[1]);
    var salary = convertToSalary($("font:contains('求 職 條 件')").parents("table").find("tr:nth-child(3)").find("tr:contains('希望待遇：')").find("td:nth-child(2)").text());
    var email = mail.html.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)[0];
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
          email: email,
          age: age,
          gender: gender,
          lowSalary: salary[0],
          highSalary: salary[1]
        });
      }
    }).then(function(employee){
      return [
        employee,
        Resume.create({
          content: content,
          employeeId: employee.id,
          receivedAt: date
        })
      ];
    }).spread(function(employee, resume){
      return employee.update({
        newestResumeId: resume.id
      });
    }).then(function(employee){
      if(callback){
        callback(employee.id);
      }
    });
  });

  fs.createReadStream(path).pipe(mailparser);
}

function convertToGender(tmpGender){
  return (tmpGender.charAt(0) == "男") ? "male" : "female";
}

function convertToSalary(tmpSalary){
  var salary = [];

  if(tmpSalary == "面議"){
    salary = [-1, -1];
  }else if(tmpSalary == "依公司規定") {
    salary = [-2, -2];
  }else{
    tmpSalary = tmpSalary.replace(/元/g,"");
    tmpSalary = tmpSalary.replace(/月薪/g,"");
    salary = tmpSalary.trim().split("~");
  }

  return salary;
}

module.exports = router;
