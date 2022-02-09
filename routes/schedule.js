var express = require('express');
var router = express.Router();
const { signIn, checkIsAdmin, isAdmin, isSignedIn } = require('../utils/auth');
const prisma = require('../prisma');

router.get("/edit", checkIsAdmin, async function(req, res, next) {
    var scheduleId = req.query.id || -1;
    var schedule = await prisma.sketchSchedule.findUnique({
        where: { id: Number(scheduleId) },
        include: {
            SketchesOnSchedules: {
                include: {
                    sketch: true
                }
            }
        }
    });
    res.render('edit_schedule', {
        admin: isAdmin(req),
        signedIn: isSignedIn(req),
        schedule: schedule
    });
});

module.exports = router;