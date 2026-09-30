const OAuthToken = require("../models/OAuthToken");

// MongoDB token document ko backend ke auth object format mein convert karta hai.
function toAuthShape(doc) {
  if (!doc) return null;
  return {
    accessToken: doc.accessToken,
    refreshToken: doc.refreshToken,
    instanceUrl: doc.instanceUrl,
    idUrl: doc.idUrl,
    // Date ko milliseconds mein badalta hai, jo token expiry checks mein use hota hai.
    expiresAt: doc.expiresAt ? doc.expiresAt.getTime() : null,
    userId: doc.userId ? String(doc.userId) : null,
  };
}

// Session ID ke basis par stored Salesforce auth fetch karta hai.
async function findBySessionId(sessionId) {
  const doc = await OAuthToken.findOne({ sessionId }).lean();
  return toAuthShape(doc);
}

// Session ke token ko create ya update karta hai; missing optional values null hote hain.
async function upsertBySessionId(sessionId, payload) {
  const doc = await OAuthToken.findOneAndUpdate(
    { sessionId },
    {
      sessionId,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken ?? null,
      instanceUrl: payload.instanceUrl,
      idUrl: payload.idUrl ?? null,
      expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
      userId: payload.userId ?? null,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
  return toAuthShape(doc);
}

// Session ID se juda OAuth token record delete karta hai.
async function deleteBySessionId(sessionId) {
  await OAuthToken.deleteOne({ sessionId });
}

// Repository methods ko doosre modules ke liye export karta hai.
module.exports = {
  findBySessionId,
  upsertBySessionId,
  deleteBySessionId,
};
