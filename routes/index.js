var express = require('express');
var router = express.Router();
const { setLocals } = require('../utils/auth');

/* GET home page. */
router.get('/', setLocals, async function(req, res, next) {
  var success_message = "";
  if(req.query.event == "upload_successful") {
    success_message = "Your file was uploaded successfully";
  }
  res.render('index', { success_message });
});

module.exports = router;
