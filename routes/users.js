var express = require('express');
var router = express.Router();
const { verify } = require('../utils/auth')

router.post('/signIn', function(req, res, next) {
  console.log(req.body);
  console.log(req.cookies);
  const { credential } = req.body ;
  verify(credential);
  res.send('respond with a resource');
});

module.exports = router;
