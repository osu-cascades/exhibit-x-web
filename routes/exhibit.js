var express = require('express');
var router = express.Router();
const prisma = require('../prisma');

router.post('/heartbeat', async function(req, res, next) {
    await prisma.exhibitHeartbeat.create({data:{
        activeDisplayId: parseInt(req.body.activeDisplayId) || -1,
        activeDisplayType: req.body.activeDisplayType || "",
    }});
    res.sendStatus(200);
});

router.get('/current', async function(req, res, next){

    const selectedDisplay = await prisma.selectedDisplay.findFirst({
      orderBy: { createdAt: "desc"}
    });

    if(!selectedDisplay) {
        res.sendStatus(500);
        return;
    }

    var payload = {};
    switch (selectedDisplay.type) {
        case "singleSketch":
            const { id, title } = await prisma.sketch.findUnique({
                where: { id: selectedDisplay.displayId}
            });
            payload = {
                sketchID: id,
                downloadURL: `https://${req.get('host')}/sketch?sketchID=${id}`,
                title: title
            };
            break;

        case "staticRotation":
            const schedule = await prisma.sketchSchedule.findUnique({
                where: {
                    id: selectedDisplay.displayId
                },
                include: {
                    SketchesOnSchedules: {
                    include: {
                        sketch: true
                    },
                    orderBy: {order: "asc"}
                    }
                }
            });
            payload = {
                id: schedule.id,
                title: schedule.title,
                periodSeconds: schedule.periodSeconds,
                sketches: schedule.SketchesOnSchedules.map(schedule => {
                    const {id, title} = schedule.sketch;
                    return {
                        SketchID: id,
                        downloadURL: `https://${req.get('host')}/sketch?sketchID=${id}`,
                        title: title,
                    };
                })
            };
            break;
        
        default:
            res.sendStatus(500);
            return;
    };

    res.send({
        type: selectedDisplay.type,
        payload: payload
    });
  });

module.exports = router;