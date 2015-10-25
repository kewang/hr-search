var express = require('express');
var nodemailer = require('nodemailer');
var router = express.Router();
var passport = require("passport");
var models = require("../models");
var Employee = models.Employee;
var Resume = models.Resume;
var Comment = models.Comment;
var User = models.User;

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'cpckewang@gmail.com',
    pass: ''
  }
});

var mailOptions = {
  from: 'HR Search <foo@example.com>' // sender address
};

router.get("/:id", function(req, res, next) {
  Employee.findById(req.params.id).then(function(employee){
    return [
      employee,
      employee.getComments({
        include: [{
          model: User
        }]
      }),
      employee.getNewestResume()
    ];
  }).spread(function(employee, comments, resume){
    res.render("employees/show", {
      employee: employee,
      comments: comments,
      resume: resume,
      auth: req.isAuthenticated()
    });
  });
});

router.post("/:id/like", function(req, res, next) {
  if (!req.isAuthenticated()) {
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login"
    }, function(err, user, info) {
      if (err) {
        return res.render("/login", {title: 'Sign In', errorMessage: err.message});
      }

      if (!user) {
        return res.render("/login", {title: 'Sign In', errorMessage: err.message});
      }

      return req.login(user, function(err){
        if (err) {
          return res.render("/login", {title: 'Sign In', errorMessage: err.message});
        } else {
          createComment(req, res);
        }
      });
    })(req, res, next);
  } else {
    createComment(req, res);
  }
});

function createComment(req, res) {
  Comment.create({
    content: req.body.content,
    employeeId: req.params.id,
    userId: req.user.id
  }).then(function(comment){
    return Employee.findById(req.params.id)
  }).then(function(employee){
    return employee.increment("likes");
  }).then(function(employee){
    if(req.body.sendto){
      mailOptions.subject = "[HR Search] " + req.user.username + " 覺得這位不錯，提供給你參考看看";
      mailOptions.to = req.body.sendto;
      mailOptions.text = req.headers.referer;

      transporter.sendMail(mailOptions, function(error, info){
        if(error){
          console.log(error);
        }else{
          console.log('Message sent: ' + info.response);
        }
      });
    }

    res.redirect(req.headers.referer);
  });
}

module.exports = router;