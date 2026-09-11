const authService = require('../services/authService');

async function exchangeAuthorizationCode(request, response) {
  try {
    const session = await authService.exchangeAuthorizationCode(request.body);
    response.cookie('summit_access_token', session.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000
    });
    const safeSession = { ...session };
    delete safeSession.accessToken;
    response.status(200).json(safeSession);
  } catch (error) {
    response.status(error.statusCode || 401).json({ error: error.message });
  }
}

async function createSession(request, response) {
  try {
    const session = await authService.verifyCognitoAccessToken(request.body.accessToken);
    response.status(200).json(session);
  } catch (error) {
    response.status(error.statusCode || 401).json({ error: error.message });
  }
}

async function getSession(request, response) {
  try {
    const token = request.cookies.summit_access_token;
    if (!token) {
      return response.status(401).json({ error: 'Authentication required.' });
    }
    const session = await authService.verifyCognitoAccessToken(token);
    response.status(200).json(session);
  } catch (error) {
    response.status(error.statusCode || 401).json({ error: error.message });
  }
}

function clearSession(request, response) {
  response.clearCookie('summit_access_token');
  response.status(204).send();
}

module.exports = { exchangeAuthorizationCode, createSession, getSession, clearSession };