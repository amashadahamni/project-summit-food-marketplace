const { CognitoJwtVerifier } = require('aws-jwt-verify');
const axios = require('axios');

let verifier;

const cognitoDomain = process.env.COGNITO_DOMAIN || 'eu-north-1dhrx3bgdc.auth.eu-north-1.amazoncognito.com';
const cognitoClientId = process.env.COGNITO_CLIENT_ID || '4d5r9b0asqd44np6tchhkhrlv3';
const cognitoClientSecret = process.env.COGNITO_CLIENT_SECRET;
const cognitoUserPoolId = process.env.COGNITO_USER_POOL_ID || 'eu-north-1_dHRX3BGdc';

function getVerifier() {
  if (!verifier) {
    verifier = CognitoJwtVerifier.create({
      userPoolId: cognitoUserPoolId,
      clientId: cognitoClientId,
      tokenUse: 'access'
    });
  }
  return verifier;
}

async function verifyCognitoAccessToken(accessToken) {
  if (!accessToken) {
    throw Object.assign(new Error('A Cognito access token is required.'), { statusCode: 400 });
  }

  try {
    const payload = await getVerifier().verify(accessToken);
    return {
      authenticated: true,
      subject: payload.sub,
      username: payload.username,
      roles: payload['cognito:groups'] || []
    };
  } catch (error) {
    if (error.statusCode) throw error;
    throw Object.assign(new Error('The Cognito access token is invalid or expired.'), { statusCode: 401 });
  }
}

async function exchangeAuthorizationCode({ code, codeVerifier, redirectUri }) {
  if (!code || !codeVerifier || !redirectUri) {
    throw Object.assign(new Error('The authorization code, verifier, and redirect URI are required.'), { statusCode: 400 });
  }

  try {
    const parameters = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: cognitoClientId,
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri
    });
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    if (cognitoClientSecret) {
      headers.Authorization = `Basic ${Buffer.from(`${cognitoClientId}:${cognitoClientSecret}`).toString('base64')}`;
    }
    const { data } = await axios.post(`https://${cognitoDomain}/oauth2/token`, parameters, {
      headers
    });
    const session = await verifyCognitoAccessToken(data.access_token);
    return { ...session, accessToken: data.access_token };
  } catch (error) {
    if (error.statusCode) throw error;
    const detail = error.response?.data?.error_description || error.response?.data?.error;
    throw Object.assign(new Error(detail || 'Cognito could not exchange the authorization code.'), { statusCode: 401 });
  }
}

module.exports = { exchangeAuthorizationCode, verifyCognitoAccessToken };