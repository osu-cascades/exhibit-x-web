const { OAuth2Client } = require('google-auth-library');
const { PrismaClient } = require('@prisma/client');

const { OAUTH_CLIENT_ID } = process.env;

const prisma = new PrismaClient();
const oauthClient = new OAuth2Client(OAUTH_CLIENT_ID);

const signIn = async (token) => {
  const ticket = await oauthClient.verifyIdToken({
    idToken: token,
    audience: OAUTH_CLIENT_ID
  });
  const { email } = ticket.getPayload();
  let user = await prisma.user.findUnique({ where: { email } });
  if(!user){
    user = await prisma.user.create({
      data: { email }
    });
  }
  return user;
};

const isSignedIn = (req) => {
  return Boolean(req?.session?.user?.email);
};

const checkSignIn = (req, res, next) => {
  if(isSignedIn(req)){
     next();
  } else {
     res.sendStatus(401);
  }
};

const isAdmin = async (req) => {
  const email = req?.session?.user?.email;
  if (!email) return false;
  const { admin } = await prisma.user.findUnique({where: {email} });
  return admin;
};

const checkIsAdmin = async (req, res, next) => {
  if(await isAdmin(req)){
     next();
  } else {
     res.sendStatus(401);
  }
};

const ownsSketch = async (req, res, next) => {
  const sketchID = req?.body?.sketchID;
  const email = req?.session?.user?.email;
  if (!(sketchID && email)) return false;
  const { userEmail } = await prisma.sketch.findUnique({where: { id: parseInt(sketchID) }});
  return userEmail === email;
};

const checkOwnsSketch = async (req, res, next) => {
  if(await ownsSketch(req)){
     next();
  } else {
     res.sendStatus(401);
  }
};

module.exports = { checkOwnsSketch, isSignedIn, signIn, checkSignIn, isAdmin, checkIsAdmin };