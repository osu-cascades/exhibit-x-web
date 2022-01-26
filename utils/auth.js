const { OAuth2Client } = require('google-auth-library');

const { OAUTH_CLIENT_ID } = process.env;

const oauthClient = new OAuth2Client(OAUTH_CLIENT_ID);

const verify = async (token) => {
  const ticket = await oauthClient.verifyIdToken({
    idToken: token,
    audience: OAUTH_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  console.log(ticket);
  const payload = ticket.getPayload();
  console.log(payload);
};

module.exports = { verify };