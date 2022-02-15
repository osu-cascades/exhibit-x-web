var express = require('express');
var router = express.Router();
const { signIn, checkIsAdmin } = require('../utils/auth')
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.post('/signIn', async function(req, res, next) {
  const { credential } = req.body ;
  req.session.user = await signIn(credential);
  res.redirect('/');
});

router.post('/updateUser', checkIsAdmin, async function(req, res, next) {
  const {user, admin} = req.body;

  if (!user || !(['true', 'false'].includes(admin))) {
    res.sendStatus(500);
    return;
  }

  await prisma.user.update({
    where: {
      email: user
    },
    data: {
      admin: admin === 'true'
    }
  });
  res.redirect('/admin');
})

module.exports = router;
