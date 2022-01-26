var express = require('express');
var router = express.Router();
const prisma = require('../prisma');

router.get('/', function(req, res, next) {
    res.send("hello exhibit");
});

router.post('/heartbeat', async function(req, res, next) {
    await prisma.exhibitHeartbeat.create({data:{}});
    res.sendStatus(200);
});

module.exports = router;