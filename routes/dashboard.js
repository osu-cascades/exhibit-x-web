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
    const stale = lastHeartbeat ? moment.duration(moment().diff(lastHeartbeat.receivedAt)).asMinutes() > 2 : true;
    const activeSketch = lastHeartbeat && lastHeartbeat.activeSketch > 0 ? lastHeartbeat.activeSketch : undefined;
    res.render('dashboard', { sketches: sketches, lastHeartbeat: lastHeartbeat ? moment(lastHeartbeat.receivedAt).fromNow() : "Never", stale: stale, activeSketch: activeSketch });
});

module.exports = router;
