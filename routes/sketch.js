var express = require('express');
var router = express.Router();
const AWS = require('aws-sdk');
const { PrismaClient } = require('@prisma/client');
const ejs = require("ejs");

const { checkSignIn, checkIsAdmin, isAdmin } = require('../utils/auth');
const { sendEmail } = require('../utils/email');

const { ENVIRONMENT, EMAIL_USER } = process.env;

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
      await sendEmail({
        to: email,
        subject: `Your Sketch ${title} has been submitted`,
        html: await ejs.renderFile("./emailTemplates/submit.ejs", { title })
      });
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
    admin: await isAdmin(req),
    signedIn: true,
    sketches
  });
});

// for now returns info for the most recently uploaded sketch
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

// Select
router.post('/select', checkIsAdmin, async function(req, res, next) {
  const { sketchId } = await prisma.selectedSketch.create({
    data: { sketchId: parseInt(req.body.sketchId) || -1 },
  });
  const { title, userEmail } = await prisma.sketch.findUnique({
    where: { id: sketchId }
  });
  await sendEmail({
    to: userEmail,
    subject: `Your Sketch, ${title}, is currently being displayed! 🙀`,
    html: await ejs.renderFile('./emailTemplates/selected.ejs', { title })
  });
  res.redirect('/admin');
});

// approves a sketch
router.post('/approve', checkIsAdmin, async function(req, res, next) {
  const { sketchID } = req.body;
  if (!(sketchID)) {
    res.sendStatus(500);
    return;
  }
  const { title, userEmail } = await prisma.sketch.update({
    where: {
      id: parseInt(sketchID)
    },
    data: { status: 'APPROVED' }
  });
  await sendEmail({
    to: userEmail,
    subject: `Your Sketch ${title} has been approved 🥳`,
    html: await ejs.renderFile('./emailTemplates/approve.ejs', { title })
  });
  res.redirect('/admin');
});

// rejects a sketch
router.post('/reject', checkIsAdmin, async function(req, res, next) {
  const { sketchID, rejectionReason } = req.body;
  if (!(sketchID)) {
    res.sendStatus(500);
    return;
  }
  const { title, userEmail } = await prisma.sketch.update({
    where: {
      id: parseInt(sketchID)
    },
    data: { status: 'REJECTED', rejectionReason }
  });
  await sendEmail({
    to: userEmail,
    subject: `Your Sketch ${title} has been rejected`,
    html: await ejs.renderFile('./emailTemplates/reject.ejs', { title, rejectionReason })
  });
  res.redirect('/admin');
});

// key user for grabbing file from s3
const sketchKey = (sketch) => `${sketch.title}-${sketch.id}-${ENVIRONMENT}`;

module.exports = router;
