var express = require('express');
var router = express.Router();
const prisma = require('../prisma');

router.post('/heartbeat', async function(req, res, next) {
    await prisma.exhibitHeartbeat.create({data:{activeSketch: parseInt(req.body.activeSketch) || -1}});
    res.sendStatus(200);
});

router.get('/current', async function(req, res, next){

    const selectedSketch = await prisma.selectedSketch.findFirst({
      orderBy: { createdAt: "desc"}
    });
    const requestedSketchId = selectedSketch ? selectedSketch.sketchId : undefined;
  
    if(!requestedSketchId) {
      res.sendStatus(500);
      return;
    }
  
    const { id, title } = await prisma.sketch.findUnique({
      where: { id: requestedSketchId}
    });
    res.send({
      sketchID: id,
      downloadURL: `https://${req.get('host')}/sketch?sketchID=${id}`,
      title: title
    });
  });

module.exports = router;