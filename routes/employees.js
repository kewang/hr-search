var express = require('express');
var router = express.Router();
var passport = require("passport");
var models = require("../models");
var Employee = models.Employee;
var Resume = models.Resume;
var Comment = models.Comment;

router.get("/:id", function(req, res, next) {
  Employee.findById(req.params.id).then(function(employee){
    return [
      employee,
      Resume.findById(employee.newestResumeId)
    ];
  }).spread(function(employee, resume){
    res.render("employees/show", {
      employee: employee,
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
    res.redirect("/");
  });
}

module.exports = router;