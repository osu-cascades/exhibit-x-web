var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.send("hello exhibit");
});

module.exports = router;