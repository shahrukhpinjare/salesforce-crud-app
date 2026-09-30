const User = require("../models/User");

// Salesforce identity URL ke aakhri path part se user ID nikalta hai.
function parseSalesforceUserId(idUrl) {
  if (!idUrl || typeof idUrl !== "string") return null;
  const parts = idUrl.split("/");
  return parts[parts.length - 1] || null;
}

// Salesforce identity se local user create/update karke latest login time save karta hai.
async function upsertFromIdentity(idUrl, email) {
  const salesforceUserId = parseSalesforceUserId(idUrl);
  // Valid Salesforce user ID na mile to database update nahi hota.
  if (!salesforceUserId) return null;

  const doc = await User.findOneAndUpdate(
    { salesforceUserId },
    {
      salesforceUserId,
      email: email || undefined,
      lastLoginAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  return doc;
}

// User repository ke functions doosre modules ko deta hai.
module.exports = {
  upsertFromIdentity,
  parseSalesforceUserId,
};
