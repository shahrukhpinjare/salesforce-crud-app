const crypto = require("crypto");
const express = require("express");
const axios = require("axios");
const db = require("../../../database/src/index");
const { sf, frontendUrl } = require("../config/env");
const { ensureValidToken, persistAuth } = require("../middleware/auth");
const tokenService = require("../services/tokenService");

// Salesforce OAuth login, callback, session check aur logout ke routes yahan define hain.
const router = express.Router();

const OAUTH_SCOPES = ["api", "refresh_token", "offline_access"].join(" ");

let code_verifier; // PKCE verifier ko token exchange tak temporarily store karta hai.

// -------------------- LOGIN: Salesforce authorization flow start karta hai --------------------
router.get("/login", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  req.session.oauthState = state;

  // Step 1: Random verifier banate hain, jo baad mein token exchange mein kaam aayega.
  code_verifier = crypto.randomBytes(32).toString("hex");

  // Step 2: Verifier ka SHA-256 challenge banate hain; isse PKCE security milti hai.
  const code_challenge = crypto
    .createHash("sha256")
    .update(code_verifier)
    .digest("base64url");

  // Step 3: OAuth parameters ke saath Salesforce authorization URL banate hain.
  const params = new URLSearchParams({
    response_type: "code",
    client_id: sf.clientId,
    redirect_uri: sf.callbackUrl,
    scope: OAUTH_SCOPES,
    state,
    code_challenge,
    code_challenge_method: "S256",
  });

  res.redirect(`${sf.loginUrl}/services/oauth2/authorize?${params.toString()}`);
});

// -------------------- CALLBACK: Salesforce response handle karke auth save karta hai --------------------
router.get("/callback", async (req, res) => {
  const { code, state, error, error_description: errorDescription } = req.query;

  if (error) {
    const msg = encodeURIComponent(errorDescription || error);
    return res.redirect(`${frontendUrl}?auth_error=${msg}`);
  }

  if (!code) {
    return res.redirect(`${frontendUrl}?auth_error=missing_code`);
  }

  // State match karke verify karte hain ki callback isi login session se aaya hai.
  if (!state || state !== req.session.oauthState) {
    return res.redirect(`${frontendUrl}?auth_error=invalid_state`);
  }

  delete req.session.oauthState;

  try {
    // Step 4: Authorization code aur PKCE verifier se access/refresh tokens lete hain.
    const response = await axios.post(
      `${sf.loginUrl}/services/oauth2/token`,
      null,
      {
        params: {
          grant_type: "authorization_code",
          code,
          client_id: sf.clientId,
          client_secret: sf.clientSecret,
          redirect_uri: sf.callbackUrl,
          code_verifier, // PKCE verifier
        },
      },
    );

    const tokenResponse = response.data;

    const auth = {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      instanceUrl: tokenResponse.instance_url,
      idUrl: tokenResponse.id,
      expiresAt: tokenResponse.issued_at
        ? Number(tokenResponse.issued_at) + 2 * 60 * 60 * 1000
        : Date.now() + 2 * 60 * 60 * 1000,
    };

    let userId = null;
    if (db.isDatabaseConnected()) {
      // Database connected ho to user ko upsert karke login audit record likhte hain.
      const user = await db.repositories.userRepository.upsertFromIdentity(
        tokenResponse.id,
      );
      userId = user?._id ?? null;
      await db.repositories.auditLogRepository.writeAudit({
        action: "login",
        sessionId: req.sessionID,
        userId,
        metadata: { instanceUrl: auth.instanceUrl },
      });
    }

    // Auth ko session/database mein save karke frontend ko success par redirect karte hain.
    await persistAuth(req, auth);
    await tokenService.saveAuth(req.sessionID, auth, userId);

    res.redirect(`${frontendUrl}?auth=success`);
  } catch (err) {
    const msg = encodeURIComponent(err.message || "oauth_failed");
    res.redirect(`${frontendUrl}?auth_error=${msg}`);
  }
});

// -------------------- ME: current session ka authentication status deta hai --------------------
router.get("/me", async (req, res) => {
  const auth = await ensureValidToken(req);
  if (!auth) {
    return res.status(401).json({ authenticated: false });
  }

  res.json({
    authenticated: true,
    instanceUrl: auth.instanceUrl,
  });
});

// -------------------- LOGOUT: auth data aur session clear karta hai --------------------
router.post("/logout", async (req, res) => {
  const sessionId = req.sessionID;

  if (db.isDatabaseConnected()) {
    // Database available ho to logout ka audit record bhi save karte hain.
    await db.repositories.auditLogRepository.writeAudit({
      action: "logout",
      sessionId,
    });
  }

  await tokenService.clearAuth(sessionId);

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

module.exports = router;
