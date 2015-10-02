var MailParser = require("mailparser").MailParser;
var fs = require("fs");

var mailparser = new MailParser();

mailparser.on("end", function(mail){
  console.log("Subject: " + mail.subject);
  console.log("From: " + JSON.stringify(mail.from));
  console.log("To: " + JSON.stringify(mail.to));
  console.log("HTML: " + mail.html);
});

fs.createReadStream("test.eml").pipe(mailparser);
