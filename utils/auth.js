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
  return Boolean(req.session.user)
}

const checkSignIn = (req, res) => {
  if(isSignedIn(req)){
     next();
  } else {
     res.sendStatus(401);
  }
}

module.exports = { isSignedIn, signIn, checkSignIn };