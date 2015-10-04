var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(req.mail);
  
  res.render({
    mail: req.mail
  });
});

module.exports = router;
