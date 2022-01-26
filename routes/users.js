var express = require('express');
var router = express.Router();
const { signIn } = require('../utils/auth')

router.post('/signIn', async function(req, res, next) {
  const { credential } = req.body ;
  req.session.user = await signIn(credential);
  res.redirect('/');
});

module.exports = router;
