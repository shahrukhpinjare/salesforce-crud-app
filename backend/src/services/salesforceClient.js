const { sf } = require("../config/env");

// Salesforce OAuth aur REST API calls ko ek jagah handle karne wali service.
async function parseSalesforceError(response) {
  let body;
  try {
    body = await response.json();
  } catch {
    body = { message: response.statusText };
  }

  const messages = [];
  if (Array.isArray(body)) {
    for (const item of body) {
      if (item.message) messages.push(item.message);
    }
  } else if (body.message) {
    messages.push(body.message);
  } else if (body.error_description) {
    messages.push(body.error_description);
  } else if (body.error) {
    messages.push(String(body.error));
  }

  const message = messages.length
    ? messages.join("; ")
    : "Salesforce API request failed";
  // Original HTTP status aur response details error ke saath attach karte hain.
  const err = new Error(message);
  err.status = response.status;
  err.details = body;
  throw err;
}

// Instance URL aur configured API version se Salesforce REST API ka base URL banata hai.
function apiBase(instanceUrl) {
  return `${instanceUrl}/services/data/v${sf.apiVersion}`;
}

// OAuth authorization code ko access/refresh tokens mein exchange karta hai.
async function exchangeAuthorizationCode(code) {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: sf.clientId,
    client_secret: sf.clientSecret,
    redirect_uri: sf.callbackUrl,
  });

  const response = await fetch(`${sf.loginUrl}/services/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    await parseSalesforceError(response);
  }

  return response.json();
}

// Expired access token ke badle refresh token se naya token leta hai.
async function refreshAccessToken(refreshToken) {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: sf.clientId,
    client_secret: sf.clientSecret,
  });

  const response = await fetch(`${sf.loginUrl}/services/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    await parseSalesforceError(response);
  }

  return response.json();
}

// Har Salesforce API request mein auth header lagata hai, response parse karta hai aur errors handle karta hai.
async function salesforceRequest(auth, path, options = {}) {
  const url = path.startsWith("http")
    ? path
    : `${apiBase(auth.instanceUrl)}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  // HTTP 204 mein response body nahi hoti, isliye null return hota hai.
  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    await parseSalesforceError(response);
  }

  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
}

// SOQL query ko URL encode karke Salesforce se matching records leta hai.
async function queryRecords(auth, soql) {
  const encoded = encodeURIComponent(soql);
  return salesforceRequest(auth, `/query?q=${encoded}`, { method: "GET" });
}

// Object type aur record ID se ek record fetch karta hai.
async function getRecord(auth, objectName, recordId) {
  return salesforceRequest(auth, `/sobjects/${objectName}/${recordId}`, {
    method: "GET",
  });
}

// Salesforce object par naya record create karta hai.
async function createRecord(auth, objectName, body) {
  return salesforceRequest(auth, `/sobjects/${objectName}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Diye gaye record ke fields update karta hai.
async function updateRecord(auth, objectName, recordId, body) {
  return salesforceRequest(auth, `/sobjects/${objectName}/${recordId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// Diya gaya record Salesforce se delete karta hai.
async function deleteRecord(auth, objectName, recordId) {
  return salesforceRequest(auth, `/sobjects/${objectName}/${recordId}`, {
    method: "DELETE",
  });
}

module.exports = {
  exchangeAuthorizationCode,
  refreshAccessToken,
  queryRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
};
