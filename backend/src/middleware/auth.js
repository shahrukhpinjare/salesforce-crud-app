const { refreshAccessToken } = require("../services/salesforceClient");
const tokenService = require("../services/tokenService");

// Expiry se ek minute pehle refresh karke, request ke beech token expire hone se bachate hain.
const TOKEN_EXPIRY_BUFFER_MS = 60 * 1000;

// Token ki expiry check karta hai; expiresAt na ho to token ko expired nahi maanta.
function isTokenExpired(auth) {
  if (!auth.expiresAt) return false;
  const expiresAtMs =
    typeof auth.expiresAt === "number"
      ? auth.expiresAt
      : new Date(auth.expiresAt).getTime();
  return Date.now() >= expiresAtMs - TOKEN_EXPIRY_BUFFER_MS;
}

// Pehle database se auth load karta hai, phir session ko fallback ke roop mein use karta hai.
async function loadAuth(req) {
  const fromDb = await tokenService.getAuth(req.sessionID);
  if (fromDb) {
    return fromDb;
  }
  return req.session.salesforce || null;
}

// Updated auth ko session aur database dono mein save karta hai.
async function persistAuth(req, auth) {
  req.session.salesforce = auth;
  await tokenService.updateAuth(req.sessionID, auth);
  return auth;
}

// Auth load karke token check karta hai; expire hone par refresh karke naya token save karta hai.
async function ensureValidToken(req) {
  let auth = await loadAuth(req);
  if (!auth || !auth.accessToken) {
    return null;
  }

  if (!isTokenExpired(auth)) {
    req.salesforceAuth = auth;
    return auth;
  }

  if (!auth.refreshToken) {
    return null;
  }

  try {
    const tokenResponse = await refreshAccessToken(auth.refreshToken);
    auth = {
      ...auth,
      accessToken: tokenResponse.access_token,
      instanceUrl: tokenResponse.instance_url || auth.instanceUrl,
      expiresAt: tokenResponse.issued_at
        ? Number(tokenResponse.issued_at) + 2 * 60 * 60 * 1000
        : Date.now() + 2 * 60 * 60 * 1000,
    };
    await persistAuth(req, auth);
    return auth;
  } catch {
    // Refresh fail ho to purana auth hata kar user ko dobara login karna padega.
    req.session.salesforce = null;
    await tokenService.clearAuth(req.sessionID);
    return null;
  }
}

// Protected route ke liye valid auth zaroori hai; warna 401 response bhejta hai.
async function requireAuth(req, res, next) {
  const auth = await ensureValidToken(req);
  if (!auth) {
    return res
      .status(401)
      .json({ message: "Not authenticated. Log in to Salesforce." });
  }
  req.salesforceAuth = auth;
  next();
}

module.exports = {
  requireAuth,
  ensureValidToken,
  persistAuth,
  loadAuth,
};
