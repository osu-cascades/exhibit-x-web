var express = require('express');
var router = express.Router();
var S3 = require('aws-sdk/clients/s3');

router.post('/', function(req, res, next) {
  console.log(req.body);
  console.log(req.files);
  res.redirect('/');
});

module.exports = router;
