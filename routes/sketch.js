var express = require('express');
var router = express.Router();
const AWS = require('aws-sdk');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const s3 = new AWS.S3();
const bucketName = 'exhibitx'; // TODO: add code for staging bucket

// adds a new sketch file to s3 bucket and adds respective entry to sketch table
router.post('/', async function(req, res, next) {
  const { file } = req.files;
  const directory = '/'; // TODO: have more complex directory system later
  const title = file.name;
  const params = {
    Body: file.data,
    Bucket: bucketName,
    Key: `${directory}${title}`
  }
  s3.putObject(params, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      res.sendStatus(400);
    } else {
      prisma.sketch.create({
        data: {
          title,
          directory
        }
      });
    res.redirect('/');
    }
  });
});

// gets zip file of sketch with provided sketchID
router.get('/', async function(req, res, next){
  const { sketchID } = req.query;
  const { directory, title } = await prisma.sketch.findUnique({
    where: { id: Number(sketchID) }
  });
  const fileKey = `${directory}${title}`;

  res.attachment(fileKey);
  const fileStream = s3.getObject({Bucket: bucketName, Key: fileKey}).createReadStream();
  fileStream.pipe(res);
});

module.exports = router;
