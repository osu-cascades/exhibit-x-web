var express = require('express');
var router = express.Router();
const prisma = require('../prisma');

router.post('/heartbeat', async function(req, res, next) {
    await prisma.exhibitHeartbeat.create({data:{activeSketch: parseInt(req.body.activeSketch) || -1}});
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
        
        default:
            res.sendStatus(500);
            return;
    };

    res.send({
        type: selectedDisplay.id,
        payload: payload
    });
  });

module.exports = router;