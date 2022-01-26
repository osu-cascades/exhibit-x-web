var express = require('express');
var router = express.Router();
const prisma = require('../prisma');
const moment = require('moment')

/* GET dashboard page. */
router.get('/', async function(req, res, next) {
    const sketches = await prisma.sketch.findMany();
    const lastHeartbeat = await prisma.exhibitHeartbeat.findFirst({
        orderBy: { receivedAt: "desc"}
      });
    const stale = lastHeartbeat ? moment.duration(moment().diff(lastHeartbeat.receivedAt)).asMinutes() > 5 : true;
    res.render('dashboard', { sketches: sketches, lastHeartbeat: lastHeartbeat ? moment(lastHeartbeat.receivedAt).fromNow() : "Never", stale: stale });
});

module.exports = router;
