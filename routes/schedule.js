var express = require('express');
var router = express.Router();
const { checkIsAdmin } = require('../utils/auth');
const prisma = require('../prisma');

router.get("/edit", checkIsAdmin, async function(req, res, next) {
    var scheduleId = req.query.id || -1;
    var schedule = await prisma.sketchSchedule.findUnique({
        where: { id: Number(scheduleId) },
        include: {
            SketchesOnSchedules: {
                include: {
                    sketch: true
                },
                orderBy: {order: "asc"}
            }
        }
    });
    var sketches = await prisma.sketch.findMany();
    sketches.filter(sketch => sketch.status === 'APPROVED');

    if (schedule) {
        schedule.sketches = schedule.SketchesOnSchedules?.map(sos => {
            return sos.sketch;
        });
    }

    res.render('edit_schedule', {
        schedule: JSON.stringify(schedule),
        sketches: JSON.stringify(sketches),
    });
});

router.post('/select', checkIsAdmin, async function(req, res, next) {
    await prisma.selectedDisplay.create({data:{
      displayId: parseInt(req.body.scheduleId) || -1,
      type: "staticRotation"
    }});
    res.redirect('/admin');
  });

module.exports = router;