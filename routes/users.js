var express = require('express');
var router = express.Router();
const { signIn, checkIsAdmin } = require('../utils/auth')

router.post('/signIn', async function(req, res, next) {
  const { credential } = req.body ;
  req.session.user = await signIn(credential);
  res.redirect('/');
});

router.post('/updateUser', checkIsAdmin, async function(req, res, next) {
  await prisma.user.update({
    where: {
      email: req.body.user
    },
    data: {
      admin: 
    }
  });
})

module.exports = router;
