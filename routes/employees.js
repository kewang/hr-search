var express = require('express');
var router = express.Router();
var models = require("../models");
var Employee = models.Employee;
var Resume = models.Resume;

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(req.mail);

  res.render({
    mail: req.mail
  });
});

router.get("/:id", function(req, res, next) {
  Employee.findById(req.params.id).then(function(employee){
    console.log(JSON.stringify(employee));

    res.render("employees/show", {
      employee: employee
    });
  });
});

module.exports = router;
