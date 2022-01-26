var express = require('express');
var router = express.Router();
const prisma = require('../prisma');

/* GET dashboard page. */
router.get('/', async function(req, res, next) {
    const sketches = await prisma.sketch.findMany();
    const lastHeartbeat = await prisma.exhibitHeartbeat.findFirst({
        orderBy: { receivedAt: "desc"}
      });
    console.log("lastHeartbeat %s", lastHeartbeat);
    res.render('dashboard', { sketches: sketches, lastHeartbeat: lastHeartbeat != undefined ? lastHeartbeat.receivedAt : undefined });
});

module.exports = router;
