const db = require("../../../database/src/index");

// Session ke Salesforce auth tokens ko database mein manage karne wali service.
async function getAuth(sessionId) {
  // Session ID ya database connection na ho to stored auth available nahi hota.
  if (!sessionId || !db.isDatabaseConnected()) {
    return null;
  }
  return db.repositories.oauthTokenRepository.findBySessionId(sessionId);
}

// Naya auth save karta hai; existing session token ho to usse update (upsert) karta hai.
async function saveAuth(sessionId, auth, userId) {
  // Database unavailable ho to auth caller ko return hota hai, par DB mein save nahi hota.
  if (!sessionId || !db.isDatabaseConnected()) {
    return auth;
  }

  await db.repositories.oauthTokenRepository.upsertBySessionId(sessionId, {
    ...auth,
    userId,
  });
  return auth;
}

// Refresh ya doosre auth changes ke baad session ka token database mein update karta hai.
async function updateAuth(sessionId, auth) {
  if (!sessionId || !db.isDatabaseConnected()) {
    return auth;
  }

  await db.repositories.oauthTokenRepository.upsertBySessionId(sessionId, auth);
  return auth;
}

// Session se stored OAuth token delete karke auth data clear karta hai.
async function clearAuth(sessionId) {
  if (!sessionId || !db.isDatabaseConnected()) {
    return;
  }
  await db.repositories.oauthTokenRepository.deleteBySessionId(sessionId);
}

module.exports = {
  getAuth,
  saveAuth,
  updateAuth,
  clearAuth,
};
