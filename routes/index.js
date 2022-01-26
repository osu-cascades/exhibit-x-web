var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var success_message = "";
  console.log(req.cookies);
  if(req.query.event == "upload_successful") {
    success_message = "Your file was uploaded successfully";
  }
  res.render('index', {
    title: 'Exhibit X',
    oauthClientID: process.env.OAUTH_CLIENT_ID,
    host: req.get('host'),
    success_message });
});

module.exports = router;
