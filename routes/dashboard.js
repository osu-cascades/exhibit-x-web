var express = require('express');
var router = express.Router();
const prisma = require('../prisma');

/* GET dashboard page. */
router.get('/', async function(req, res, next) {
    const sketches = await prisma.sketch.findMany();
    res.render('dashboard', { sketches: sketches });
});

module.exports = router;
