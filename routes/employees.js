var express = require('express');
var router = express.Router();
var models = require("../models");
var Employee = models.Employee;
var Resume = models.Resume;

router.get("/:id", function(req, res, next) {
  Employee.findById(req.params.id).then(function(employee){
    return [
      employee,
      Resume.findById(employee.newestResumeId)
    ];
  }).spread(function(employee, resume){
    res.render("employees/show", {
      employee: employee,
      resume: resume
    });
  });
});

router.post("/:id/like", function(req, res, next) {
  if(!req.isAuthenticated()){
    return res.redirect("/login");
  }

  res.send("test");
  res.end();
});

module.exports = router;
