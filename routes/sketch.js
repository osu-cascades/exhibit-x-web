var express = require('express');
var router = express.Router();
const S3 = require('aws-sdk/clients/s3');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.post('/', async function(req, res, next) {
  const { file } = req.files;
  await prisma.sketch.create({
    data: {
      title: file.name,
      directory: '/'
    }
  });
  res.redirect('/');
});

module.exports = router;
