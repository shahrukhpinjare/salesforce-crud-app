const express = require("express");
const db = require("../../../database/src/index");
const { requireAuth } = require("../middleware/auth");
const fieldConfigService = require("../services/fieldConfigService");
const {
  queryRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
} = require("../services/salesforceClient");

// Salesforce objects aur records ke read/create/update/delete API routes yahan hain.
const router = express.Router();

// Is router ke har endpoint ke liye valid Salesforce login zaroori hai.
router.use(requireAuth);

// Audit log database connected ho to action save karta hai; logging failure request ko nahi rokta.
async function audit(req, entry) {
  if (!db.isDatabaseConnected()) return;
  try {
    await db.repositories.auditLogRepository.writeAudit({
      sessionId: req.sessionID,
      userId: req.salesforceAuth?.userId ?? null,
      ...entry,
    });
  } catch {
    // Audit logging fail ho to bhi main request ko continue hone dete hain.
  }
}

// UI ke liye available Salesforce object names deta hai.
router.get("/objects", async (_req, res, next) => {
  try {
    const objects = await fieldConfigService.getObjectNames();
    res.json({ objects });
  } catch (err) {
    next(err);
  }
});

// Diye gaye object ke configured fields deta hai; unknown object ko reject karta hai.
router.get("/objects/:objectName/fields", async (req, res, next) => {
  try {
    const { objectName } = req.params;
    if (!fieldConfigService.isValidObjectName(objectName)) {
      return res.status(400).json({ message: "Invalid object name" });
    }

    const fields = await fieldConfigService.getFieldsForObject(objectName);
    res.json({
      objectName,
      fields,
    });
  } catch (err) {
    next(err);
  }
});

// Object records ko paginated form mein fetch karke read action audit karta hai.
router.get("/objects/:objectName/records", async (req, res, next) => {
  try {
    const { objectName } = req.params;
    if (!fieldConfigService.isValidObjectName(objectName)) {
      return res.status(400).json({ message: "Invalid object name" });
    }

    const page = Math.max(0, parseInt(req.query.page, 10) || 0);
    // Page size ko kam se kam 1 aur zyada se zyada 200 tak limit karte hain.
    const pageSize = Math.min(
      200,
      Math.max(1, parseInt(req.query.pageSize, 10) || 20),
    );
    const offset = page * pageSize;

    const fieldNames =
      await fieldConfigService.getQueryableFieldNames(objectName);
    const soql = `SELECT ${fieldNames.join(", ")} FROM ${objectName} ORDER BY LastModifiedDate DESC LIMIT ${pageSize} OFFSET ${offset}`;

    const result = await queryRecords(req.salesforceAuth, soql);

    await audit(req, { action: "read", objectName });

    res.json({
      objectName,
      page,
      pageSize,
      records: result.records || [],
      totalSize: result.totalSize,
      hasMore: (result.records || []).length === pageSize,
    });
  } catch (err) {
    next(err);
  }
});

// Object aur record ID ke basis par ek Salesforce record fetch karta hai.
router.get("/objects/:objectName/records/:id", async (req, res, next) => {
  try {
    const { objectName, id } = req.params;
    if (!fieldConfigService.isValidObjectName(objectName)) {
      return res.status(400).json({ message: "Invalid object name" });
    }

    const record = await getRecord(req.salesforceAuth, objectName, id);
    await audit(req, { action: "read", objectName, recordId: id });
    res.json(record);
  } catch (err) {
    next(err);
  }
});

// Naya record banane se pehle allowed fields aur required values validate karta hai.
router.post("/objects/:objectName/records", async (req, res, next) => {
  try {
    const { objectName } = req.params;
    if (!fieldConfigService.isValidObjectName(objectName)) {
      return res.status(400).json({ message: "Invalid object name" });
    }

    const fields = await fieldConfigService.getFieldsForObject(objectName);
    const allowed = new Set(fields.map((f) => f.apiName));
    const body = pickAllowedFields(req.body, allowed);

    const missing = fields.filter(
      (f) => f.requiredOnCreate && isEmpty(body[f.apiName]),
    );
    if (missing.length) {
      return res.status(400).json({
        message: "Missing required fields",
        fields: missing.map((f) => f.apiName),
      });
    }

    const result = await createRecord(req.salesforceAuth, objectName, body);
    await audit(req, {
      action: "create",
      objectName,
      recordId: result?.id ?? null,
      metadata: body,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// Sirf allowed fields update karta hai, phir updated record response mein deta hai.
router.patch("/objects/:objectName/records/:id", async (req, res, next) => {
  try {
    const { objectName, id } = req.params;
    if (!fieldConfigService.isValidObjectName(objectName)) {
      return res.status(400).json({ message: "Invalid object name" });
    }

    const fields = await fieldConfigService.getFieldsForObject(objectName);
    const allowed = new Set(fields.map((f) => f.apiName));
    const body = pickAllowedFields(req.body, allowed);

    if (Object.keys(body).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    await updateRecord(req.salesforceAuth, objectName, id, body);
    const record = await getRecord(req.salesforceAuth, objectName, id);
    await audit(req, {
      action: "update",
      objectName,
      recordId: id,
      metadata: body,
    });
    res.json(record);
  } catch (err) {
    next(err);
  }
});

// Salesforce se record delete karke delete action audit karta hai.
router.delete("/objects/:objectName/records/:id", async (req, res, next) => {
  try {
    const { objectName, id } = req.params;
    if (!fieldConfigService.isValidObjectName(objectName)) {
      return res.status(400).json({ message: "Invalid object name" });
    }

    await deleteRecord(req.salesforceAuth, objectName, id);
    await audit(req, { action: "delete", objectName, recordId: id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Request body se sirf configured API fields rakhta hai; baaki fields ignore hoti hain.
function pickAllowedFields(payload, allowedApiNames) {
  if (!payload || typeof payload !== "object") return {};
  const out = {};
  for (const [key, value] of Object.entries(payload)) {
    if (allowedApiNames.has(key) && value !== undefined) {
      out[key] = value;
    }
  }
  return out;
}

// Undefined, null ya blank string ko empty value maana jata hai.
function isEmpty(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

module.exports = router;
