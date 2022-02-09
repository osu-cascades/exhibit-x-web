var express = require('express');
var router = express.Router();
const AWS = require('aws-sdk');
const { PrismaClient } = require('@prisma/client');
const { checkSignIn, checkIsAdmin, isAdmin } = require('../utils/auth');

const { ENVIRONMENT } = process.env;

const prisma = new PrismaClient();
const s3 = new AWS.S3();
const bucketName = 'exhibitx'; // TODO: add code for staging bucket

// adds a new sketch file to s3 bucket and adds respective entry to sketch table
router.post('/', checkSignIn, async function(req, res, next) {
  const file = req?.files?.file;
  const email = req?.session?.user?.email
  if(!(file && email)) res.sendStatus(400);
  const title = file.name.split('.zip')[0];
  const sketch = await prisma.sketch.create({ data: { title, userEmail: email } });
  const params = {
    Body: file.data,
    Bucket: bucketName,
    Key: sketchKey(sketch)
  }
  s3.putObject(params, async (err, data) => {
    if (err) {
      console.log(err, err.stack);
      res.sendStatus(400);
    } else {
      res.redirect('/?event=upload_successful');
    }
  });
});

// gets zip file of sketch with provided sketchID
router.get('/', async function(req, res, next){
  const { sketchID } = req.query;
  if (!sketchID) {
    res.sendStatus(500);
    return;
  }
  const sketch = await prisma.sketch.findUnique({where: { id: Number(sketchID) }});

  res.attachment(`${sketch.title}.zip`);
  const fileStream = s3.getObject({Bucket: bucketName, Key: sketchKey(sketch)}).createReadStream();
  fileStream.pipe(res);
});

// the dashboard for a user to view their own sketches
router.get('/my-sketches', checkSignIn, async function(req, res, next){
  const sketches = await prisma.sketch.findMany({
    where: {
      userEmail: req.session.user.email
    }
  });
  res.render('mySketches', {
    admin: isAdmin(req),
    signedIn: true,
    sketches
  });
});

// Select
router.post('/select', checkIsAdmin, async function(req, res, next) {
  await prisma.selectedSketch.create({data:{sketchId: parseInt(req.body.sketchId) || -1}});
  res.redirect('/admin');
});

// changes the status of a sketch
router.post('/evaluate', checkIsAdmin, async function(req, res, next) {
  const { sketchID, status } = req.body;
  if (!(sketchID || ['APPROVED', 'REJECTED'].includes(status))) {
    res.sendStatus(500);
    return;
  }
  await prisma.sketch.update({
    where: {
      id: parseInt(sketchID)
    },
    data: { status }
  });
  res.redirect('/admin');
});

// key user for grabbing file from s3
const sketchKey = (sketch) => `${sketch.title}-${sketch.id}-${ENVIRONMENT}`;

module.exports = router;
