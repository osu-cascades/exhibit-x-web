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

  const selectedDisplay = await prisma.selectedDisplay.findFirst({
    orderBy: { createdAt: "desc"}
  });

  const users = await prisma.user.findMany();

  const schedules = await prisma.sketchSchedule.findMany({
    include: {
      SketchesOnSchedules: {
        include: {
          sketch: true
        }
      }
    }
  });

  const stale = lastHeartbeat ? moment.duration(moment().diff(lastHeartbeat.receivedAt)).asMinutes() > 2 : true;
  const activeDisplayId = lastHeartbeat && lastHeartbeat.activeSketch > 0 ? lastHeartbeat.activeSketch : undefined;
  const requestedSketchId = selectedDisplay ? selectedDisplay.displayId : undefined;
  res.render('admin_dashboard', {
    sketches: sketches,
    lastHeartbeat: lastHeartbeat ? moment(lastHeartbeat.receivedAt).fromNow() : "Never", 
    stale: stale,
    activeSketch: activeDisplayId,
    requestedDisplay: requestedSketchId,
    activeRow: activeDisplayId != undefined && activeDisplayId == requestedSketchId ? activeDisplayId : undefined,       //TODO: Clean up this stuff
    pendingRow: requestedSketchId != undefined && activeDisplayId != requestedSketchId ? requestedSketchId : undefined,
    users: users,
    schedules: schedules,
    runningType: selectedDisplay?.type
  });
});

module.exports = router;
