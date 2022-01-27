var express = require('express');
var router = express.Router();
const prisma = require('../prisma');
const moment = require('moment');
const { checkIsAdmin } = require('../utils/auth')

/* GET dashboard page. */
router.get('/', checkIsAdmin,  async function(req, res, next) {
  const sketches = await prisma.sketch.findMany();
  const lastHeartbeat = await prisma.exhibitHeartbeat.findFirst({
    orderBy: { receivedAt: "desc"}
  });

  const selectedSketch = await prisma.selectedSketch.findFirst({
    orderBy: { createdAt: "desc"}
  });

  const stale = lastHeartbeat ? moment.duration(moment().diff(lastHeartbeat.receivedAt)).asMinutes() > 2 : true;
  const activeSketchId = lastHeartbeat && lastHeartbeat.activeSketch > 0 ? lastHeartbeat.activeSketch : undefined;
  const requestedSketchId = selectedSketch ? selectedSketch.sketchId : undefined;
  res.render('dashboard', {
    sketches: sketches,
    lastHeartbeat: lastHeartbeat ? moment(lastHeartbeat.receivedAt).fromNow() : "Never", 
    stale: stale,
    activeSketch: activeSketchId,
    activeRow: activeSketchId != undefined && activeSketchId == requestedSketchId ? activeSketchId : undefined,       //TODO: Clean up this stuff
    pendingRow: requestedSketchId != undefined && activeSketchId != requestedSketchId ? requestedSketchId : undefined
  });
});

module.exports = router;
