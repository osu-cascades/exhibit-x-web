const express = require('express');
const router = new express.Router();
const {getAuthLevel} = require('../utils/auth');

/* GET home page. */
router.get('/', getAuthLevel, async function(req, res, next) {
  let successMessage = '';
  if (req.query.event == 'upload_successful') {
    successMessage = 'Your file was uploaded successfully';
  }
  res.render('index', {successMessage});
});

module.exports = router;
