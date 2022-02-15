const { OAuth2Client } = require('google-auth-library');
const { PrismaClient } = require('@prisma/client');

const { OAUTH_CLIENT_ID, ENVIRONMENT } = process.env;

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

const setLocals = async (req, res, next) => {
  res.locals = {
    title: 'Exhbit X',
    oauthClientID: process.env.OAUTH_CLIENT_ID,
    host: `${ENVIRONMENT === 'dev' ? 'http' : 'https'}://${req.get('host')}`,
    signedIn: isSignedIn(req),
    admin: await isAdmin(req),
  };
  next();
}

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
  const sketch = await prisma.sketch.findUnique({where: { id: parseInt(sketchID) }});
  if (sketch.userEmail === email)
    return sketch;
  return false;
};

const checkOwnsSketch = async (req, res, next) => {
  const sketch = await ownsSketch(req);
  if(sketch){
    req.sketch = sketch;
    next();
  } else {
    res.sendStatus(401);
  }
};

module.exports = { checkOwnsSketch, isSignedIn, signIn, checkSignIn, isAdmin, checkIsAdmin, setLocals };