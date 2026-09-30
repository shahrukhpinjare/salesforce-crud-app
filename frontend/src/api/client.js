// // Backend API ka base URL; env value na ho to local development URL use hota hai.
// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// // Salesforce login flow start karne ke liye backend URL deta hai.
// export function getLoginUrl() {
//   return `${API_URL}/api/auth/login`;
// }

// // Response body parse karta hai aur API error ko useful details ke saath throw karta hai.
// async function parseResponse(response) {
//   const text = await response.text();
//   let data = null;
//   if (text) {
//     try {
//       data = JSON.parse(text);
//     } catch {
//       data = { message: text };
//     }
//   }

//   if (!response.ok) {
//     const message = data?.message || response.statusText || "Request failed";
//     const err = new Error(message);
//     err.status = response.status;
//     err.details = data?.details;
//     throw err;
//   }

//   return data;
// }

// // Common API helper: session cookies bhejta hai, JSON headers set karta hai aur response parse karta hai.
// export async function api(path, options = {}) {
//   const { headers, ...rest } = options;
//   const response = await fetch(`${API_URL}${path}`, {
//     credentials: "include",
//     headers: {
//       ...(rest.body ? { "Content-Type": "application/json" } : {}),
//       ...headers,
//     },
//     ...rest,
//   });
//   return parseResponse(response);
// }

// // Current login status laata hai; 401 ka matlab user logged in nahi hai.
// export async function fetchAuthStatus() {
//   try {
//     return await api("/api/auth/me");
//   } catch (err) {
//     if (err.status === 401) {
//       return { authenticated: false };
//     }
//     throw err;
//   }
// }

// // Current user ka Salesforce session logout karta hai.
// export async function logout() {
//   return api("/api/auth/logout", { method: "POST" });
// }

// // Backend se supported Salesforce objects ki list laata hai.
// export async function fetchObjects() {
//   return api("/api/salesforce/objects");
// }

// // Ek Salesforce object ke configured fields fetch karta hai.
// export async function fetchObjectFields(objectName) {
//   return api(
//     `/api/salesforce/objects/${encodeURIComponent(objectName)}/fields`,
//   );
// }

// // Object records ko page aur page size ke hisaab se fetch karta hai.
// export async function fetchRecords(objectName, page = 0, pageSize = 20) {
//   const params = new URLSearchParams({
//     page: String(page),
//     pageSize: String(pageSize),
//   });
//   return api(
//     `/api/salesforce/objects/${encodeURIComponent(objectName)}/records?${params}`,
//   );
// }

// // Object aur record ID se ek record fetch karta hai.
// export async function fetchRecord(objectName, id) {
//   return api(
//     `/api/salesforce/objects/${encodeURIComponent(objectName)}/records/${encodeURIComponent(id)}`,
//   );
// }

// // Naya Salesforce record backend ke through create karta hai.
// export async function createRecord(objectName, body) {
//   return api(
//     `/api/salesforce/objects/${encodeURIComponent(objectName)}/records`,
//     {
//       method: "POST",
//       body: JSON.stringify(body),
//     },
//   );
// }

// // Existing Salesforce record ke fields update karta hai.
// export async function updateRecord(objectName, id, body) {
//   return api(
//     `/api/salesforce/objects/${encodeURIComponent(objectName)}/records/${encodeURIComponent(id)}`,
//     {
//       method: "PATCH",
//       body: JSON.stringify(body),
//     },
//   );
// }

// // Salesforce record delete karta hai; successful 204 response mein body nahi hoti.
// export async function deleteRecord(objectName, id) {
//   const response = await fetch(
//     `${API_URL}/api/salesforce/objects/${encodeURIComponent(objectName)}/records/${encodeURIComponent(id)}`,
//     {
//       method: "DELETE",
//       credentials: "include",
//     },
//   );
//   if (!response.ok && response.status !== 204) {
//     return parseResponse(response);
//   }
//   return null;
// }

// Gemini

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function getLoginUrl() {
  return `${API_URL}/api/auth/login`;
}

async function parseResponse(response) {
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const message = data?.message || response.statusText || "Request failed";
    const err = new Error(message);
    err.status = response.status;
    err.details = data?.details;
    throw err;
  }

  return data;
}

export async function api(path, options = {}) {
  const { headers, ...rest } = options;
  const token = localStorage.getItem("sf_session_id");

  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { "x-session-id": token } : {}),
      ...headers,
    },
    ...rest,
  });
  return parseResponse(response);
}

export async function fetchAuthStatus() {
  try {
    return await api("/api/auth/me");
  } catch (err) {
    if (err.status === 401) {
      return { authenticated: false };
    }
    throw err;
  }
}

export async function logout() {
  return api("/api/auth/logout", { method: "POST" });
}

export async function fetchObjects() {
  return api("/api/salesforce/objects");
}

export async function fetchObjectFields(objectName) {
  return api(
    `/api/salesforce/objects/${encodeURIComponent(objectName)}/fields`,
  );
}

export async function fetchRecords(objectName, page = 0, pageSize = 20) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  return api(
    `/api/salesforce/objects/${encodeURIComponent(objectName)}/records?${params}`,
  );
}

export async function fetchRecord(objectName, id) {
  return api(
    `/api/salesforce/objects/${encodeURIComponent(objectName)}/records/${encodeURIComponent(id)}`,
  );
}

export async function createRecord(objectName, body) {
  return api(
    `/api/salesforce/objects/${encodeURIComponent(objectName)}/records`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function updateRecord(objectName, id, body) {
  return api(
    `/api/salesforce/objects/${encodeURIComponent(objectName)}/records/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}

export async function deleteRecord(objectName, id) {
  const token = localStorage.getItem("sf_session_id");
  const response = await fetch(
    `${API_URL}/api/salesforce/objects/${encodeURIComponent(objectName)}/records/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        ...(token ? { "x-session-id": token } : {}),
      },
    },
  );
  if (!response.ok && response.status !== 204) {
    return parseResponse(response);
  }
  return null;
}

// Gemini
