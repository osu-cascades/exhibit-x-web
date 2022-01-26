var express = require('express');
var router = express.Router();
const prisma = require('../prisma');

/* GET dashboard page. */
router.get('/', async function(req, res, next) {
    const sketches = await prisma.sketch.findMany();
    const { createdAt } = await prisma.sketch.findFirst({
        orderBy: { createdAt: "desc"}
      });
    res.render('dashboard', { sketches: sketches, lastHeartbeat: createdAt });
});

module.exports = router;
