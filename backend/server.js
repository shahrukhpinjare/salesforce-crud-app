const express = require("express");
const axios = require("axios");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory auth & PKCE store
let currentCodeVerifier = "";
let sessionAuth = null;

// PKCE Helper Functions
function base64URLEncode(str) {
  return str
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function generateCodeVerifier() {
  return base64URLEncode(crypto.randomBytes(32));
}

function generateCodeChallenge(verifier) {
  return base64URLEncode(crypto.createHash("sha256").update(verifier).digest());
}

// 1. Salesforce Login Route
app.get("/api/auth/login", (req, res) => {
  currentCodeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(currentCodeVerifier);

  const authUrl =
    `${process.env.SF_LOGIN_URL}/services/oauth2/authorize?` +
    new URLSearchParams({
      response_type: "code",
      client_id: process.env.SF_CLIENT_ID,
      redirect_uri: process.env.SF_CALLBACK_URL,
      scope: "api refresh_token",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

  res.redirect(authUrl);
});

// 2. OAuth Callback Route
app.get("/api/auth/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("Authorization code missing");

  try {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.SF_CLIENT_ID,
      client_secret: process.env.SF_CLIENT_SECRET,
      redirect_uri: process.env.SF_CALLBACK_URL,
      code: code,
      code_verifier: currentCodeVerifier,
    });

    const response = await axios.post(
      `${process.env.SF_LOGIN_URL}/services/oauth2/token`,
      params.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );

    sessionAuth = {
      accessToken: response.data.access_token,
      instanceUrl: response.data.instance_url,
    };

    // React frontend redirect (agar frontend port alag ho jaise 5173 to yahan change kar sakte hain)
    res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
  } catch (error) {
    console.error("Token Error:", error.response?.data || error.message);
    res
      .status(500)
      .json({ error: "Token exchange failed", details: error.response?.data });
  }
});

// Auth Status check endpoint
app.get("/api/auth/status", (req, res) => {
  res.json({ isAuthenticated: !!sessionAuth });
});

// Helper for Salesforce API Headers
const getSfHeaders = () => ({
  Authorization: `Bearer ${sessionAuth?.accessToken}`,
  "Content-Type": "application/json",
});

// 3. Dynamic Metadata/Describe API (5 to 10 fields fetch karna)
app.get("/api/salesforce/:objectName/describe", async (req, res) => {
  const { objectName } = req.params;
  if (!sessionAuth) return res.status(401).json({ error: "Not authenticated" });

  try {
    const response = await axios.get(
      `${sessionAuth.instanceUrl}/services/data/v58.0/sobjects/${objectName}/describe`,
      { headers: getSfHeaders() },
    );

    // Pick 5 to 10 valid fields for UI display
    const fields = response.data.fields
      .filter(
        (f) =>
          !f.name.endsWith("__c") &&
          (["string", "phone", "email", "picklist", "currency"].includes(
            f.type,
          ) ||
            f.name === "Id" ||
            f.name === "Name"),
      )
      .slice(0, 8)
      .map((f) => ({
        name: f.name,
        label: f.label,
        type: f.type,
        updateable: f.updateable,
        createable: f.createable,
      }));

    res.json(fields);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// 4. Fetch Records with Pagination (20 per page)
app.get("/api/salesforce/:objectName/records", async (req, res) => {
  const { objectName } = req.params;
  if (!sessionAuth) return res.status(401).json({ error: "Not authenticated" });

  const offset = parseInt(req.query.offset) || 0;
  const fields = req.query.fields || "Id, Name";

  try {
    const soql = `SELECT ${fields} FROM ${objectName} LIMIT 20 OFFSET ${offset}`;
    const response = await axios.get(
      `${sessionAuth.instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(soql)}`,
      { headers: getSfHeaders() },
    );
    res.json(response.data.records);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// 5. Create Record
app.post("/api/salesforce/:objectName", async (req, res) => {
  const { objectName } = req.params;
  if (!sessionAuth) return res.status(401).json({ error: "Not authenticated" });

  try {
    const response = await axios.post(
      `${sessionAuth.instanceUrl}/services/data/v58.0/sobjects/${objectName}`,
      req.body,
      { headers: getSfHeaders() },
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// 6. Update Record
app.patch("/api/salesforce/:objectName/:id", async (req, res) => {
  const { objectName, id } = req.params;
  if (!sessionAuth) return res.status(401).json({ error: "Not authenticated" });

  try {
    await axios.patch(
      `${sessionAuth.instanceUrl}/services/data/v58.0/sobjects/${objectName}/${id}`,
      req.body,
      { headers: getSfHeaders() },
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// 7. Delete Record
app.delete("/api/salesforce/:objectName/:id", async (req, res) => {
  const { objectName, id } = req.params;
  if (!sessionAuth) return res.status(401).json({ error: "Not authenticated" });

  try {
    await axios.delete(
      `${sessionAuth.instanceUrl}/services/data/v58.0/sobjects/${objectName}/${id}`,
      { headers: getSfHeaders() },
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
