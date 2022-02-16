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

router.post('/edit', checkIsAdmin, async function(req, res, next) {
    const schedule = JSON.parse(req.body.schedulePayload);

    // TODO: Refactor
    const validSchedule = schedule => {
        return schedule !== undefined 
            && schedule.title !== undefined 
            && schedule.title !== "" && schedule.periodSeconds !== undefined 
            &&  !isNaN(parseInt(schedule.periodSeconds));
    }
    
    if (!validSchedule(schedule)) {
        res.sendStatus(500);
        return;
    }

    const updated_schedule = await prisma.sketchSchedule.upsert({
        where: {
            id: parseInt(schedule.id) || -1
        },
        update: {
            title: schedule.title,
            periodSeconds: parseInt(schedule.periodSeconds)
        },
        create: {
            title: schedule.title,
            periodSeconds: parseInt(schedule.periodSeconds),
        }
    });
   
    // TODO: There is probably a way to do this all in one transaction

    //Delete all existing schedule<->sketch links
    await prisma.sketchesOnSchedules.deleteMany({
        where: {
            scheduleId: updated_schedule.id
        }
    });

    for (const [index, sketch] of schedule.sketches.entries()) {
        await prisma.sketchesOnSchedules.create({
            data: {
                order: index,
                scheduleId: updated_schedule.id,
                sketchId: sketch.id,
            }
        });
    }

    res.sendStatus(200);
});

router.post('/select', checkIsAdmin, async function(req, res, next) {
    await prisma.selectedDisplay.create({data:{
      displayId: parseInt(req.body.scheduleId) || -1,
      type: "staticRotation"
    }});
    res.redirect('/admin');
  });

module.exports = router;