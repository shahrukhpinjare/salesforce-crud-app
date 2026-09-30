// const express = require("express");
// const session = require("express-session");
// const MongoStore = require("connect-mongo");
// const cors = require("cors");
// const db = require("../../database/src/index");
// const {
//   port,
//   sessionSecret,
//   frontendUrl,
//   mongodbUri,
// } = require("./config/env");
// const authRoutes = require("./routes/auth");
// const salesforceRoutes = require("./routes/salesforce");

// // Backend Express app ko configure karke database aur routes ke saath start karta hai.
// const app = express();

// // Sirf configured frontend origin ko credentials/cookies ke saath API access deta hai.
// app.use(
//   cors({
//     origin: frontendUrl,
//     credentials: true,
//   }),
// );

// // Incoming JSON request bodies ko parse karke req.body mein rakhta hai.
// app.use(express.json());

// // User sessions ko MongoDB mein store karta hai, taaki login state requests ke beech bani rahe.
// app.use(
//   session({
//     name: "connect.sid",
//     secret: sessionSecret,
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({
//       mongoUrl: mongodbUri,
//       collectionName: "sessions",
//     }),
//     cookie: {
//       httpOnly: true,
//       sameSite: "lax",
//       secure: false,
//       maxAge: 24 * 60 * 60 * 1000,
//     },
//   }),
// );

// // Server aur database connection status check karne ke liye health endpoint.
// app.get("/health", (_req, res) => {
//   res.json({
//     status: "ok",
//     database: db.isDatabaseConnected(),
//   });
// });

// // Authentication aur Salesforce record APIs ke routes register karta hai.
// app.use("/api/auth", authRoutes);
// app.use("/api/salesforce", salesforceRoutes);

// // Route ya middleware error ko suitable HTTP status aur JSON response mein bhejta hai.
// app.use((err, _req, res, _next) => {
//   const status =
//     err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
//   res.status(status).json({
//     message: err.message || "Internal server error",
//     details: err.details,
//   });
// });

// // Pehle database connect/seed karke, uske baad HTTP server listen karwata hai.
// async function start() {
//   await db.connectDatabase(mongodbUri);

//   try {
//     // Account field config na ho to saare default field configs seed karta hai.
//     const fieldCount =
//       await db.repositories.fieldConfigRepository.countByObjectName("Account");
//     if (fieldCount === 0) {
//       await db.seed.seedFieldConfigs();
//       console.log("Seeded object field configs in MongoDB.");
//     }
//   } catch (err) {
//     console.warn("Field config seed skipped:", err.message);
//   }

//   // Backend ko configured port par start karta hai aur basic status log karta hai.
//   app.listen(port, () => {
//     console.log(`Backend listening on http://localhost:${port}`);
//     console.log(`CORS origin: ${frontendUrl}`);
//     console.log(`MongoDB connected: ${db.isDatabaseConnected()}`);
//   });
// }

// // Startup fail ho to error log karke process ko failure status ke saath band karta hai.
// start().catch((err) => {
//   console.error("Failed to start server:", err);
//   process.exit(1);
// });

// Gemini

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const db = require("../../database/src/index");
const {
  port,
  sessionSecret,
  frontendUrl,
  mongodbUri,
} = require("./config/env");
const authRoutes = require("./routes/auth");
const salesforceRoutes = require("./routes/salesforce");

// Backend Express app ko configure karke database aur routes ke saath start karta hai.
const app = express();

// 1. RENDER PROXY TRUST (Zaroori: HTTPS cookies accept karne ke liye)
app.set("trust proxy", 1);

// Sirf configured frontend origin ko credentials/cookies ke saath API access deta hai.
app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  }),
);

// Incoming JSON request bodies ko parse karke req.body mein rakhta hai.
app.use(express.json());

// 2. Production check (Render par HTTPS aur cross-domain ke liye)
const isProduction =
  process.env.NODE_ENV === "production" || !frontendUrl.includes("localhost");

// User sessions ko MongoDB mein store karta hai
app.use(
  session({
    name: "connect.sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    proxy: true, // Reverse proxy support
    store: MongoStore.create({
      mongoUrl: mongodbUri,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax", // Cross-domain ke liye "none"
      secure: isProduction ? true : false, // "none" ke sath secure: true compulsory hai
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

// Server aur database connection status check karne ke liye health endpoint.
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    database: db.isDatabaseConnected(),
  });
});

// Authentication aur Salesforce record APIs ke routes register karta hai.
app.use("/api/auth", authRoutes);
app.use("/api/salesforce", salesforceRoutes);

// Route ya middleware error ko suitable HTTP status aur JSON response mein bhejta hai.
app.use((err, _req, res, _next) => {
  const status =
    err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
  res.status(status).json({
    message: err.message || "Internal server error",
    details: err.details,
  });
});

// Pehle database connect/seed karke, uske baad HTTP server listen karwata hai.
async function start() {
  await db.connectDatabase(mongodbUri);

  try {
    const fieldCount =
      await db.repositories.fieldConfigRepository.countByObjectName("Account");
    if (fieldCount === 0) {
      await db.seed.seedFieldConfigs();
      console.log("Seeded object field configs in MongoDB.");
    }
  } catch (err) {
    console.warn("Field config seed skipped:", err.message);
  }

  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
    console.log(`CORS origin: ${frontendUrl}`);
    console.log(`MongoDB connected: ${db.isDatabaseConnected()}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
